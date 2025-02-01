import { jsPDF } from "jspdf";
import { CertificationWithBulletPoints, EducationWithBulletPoints, ResumeDataType, WorkWithBulletPoints } from "./common";
import logger from "../utils/logger";


type MapFieldsFunction<T> = (item: T) => {
    title: string;
    subtitle: string;
    startDate: Date;
    endDate: Date | null; // Optional as it might not be present for some items
    description: string[];
    isNoEndDate?: boolean;
};

export class ResumePDF {
    private resumeData: ResumeDataType;

    private doc: jsPDF;
    private margin: number = 10;

    private fontName: string = "helvetica";
    private fontSize_Header: number = 11;
    private fontSize_SectionTitle: number = 14;
    private fontSize_Title: number = 11;
    private fontSize_Content: number = 12;

    private ySpaceHeaderBody: number = 13; // Space between resume's header and the rest
    private ySpaceTitleDescription: number = 10; // Space between title and description/content
    private ySpaceContents: number = 5; // Space between one content in section and new title
    private ySpaceNweSection: number = 5; // Space to be added between end of section and starting new section
    private ySpaceSectionTitle: number = 8; // Space between main section title (after its seprating line) and the first title
    private ySpacePulletPoints: number = 5; // Space between one point with another (space in description/content). Note: description is the pullet points in resume.

    // Starting at this vertical position, this variable is to keep tracking of the current y position.
    private yCurrent: number = 20;

    private maxTextLength: number = 180;

    constructor(
        input: ResumeDataType
    ) {
        this.doc = new jsPDF();
        this.resumeData = input;
        logger.info('ResumePDF/constructor')
    }

    private updateY(increaseBy: number) {
        this.yCurrent += increaseBy;
        return this.yCurrent;
    }

    private formatDate(date: Date | null): string {
        logger.info('ResumePDF/formatDate')
        try {
            if (!date) return "Present";
            const strDate = date?.toString();
            return new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
            }).format(new Date(strDate));
        } catch (error) {
            logger.error('ResumePDF/formatDate error: ' + error);
            return "";
        }

    };

    private centerText(text: string, y: number, fontSize: number, isBold = false) {
        logger.info('ResumePDF/centerText')
        try {
            this.doc.setFontSize(fontSize);
            this.doc.setFont(this.fontName, isBold ? "bold" : "normal");
            const textWidth = (this.doc.getStringUnitWidth(text) * fontSize) / this.doc.internal.scaleFactor;
            const pageWidth = this.doc.internal.pageSize.getWidth();
            const x = this.margin + (pageWidth - 2 * this.margin - textWidth) / 2;
            this.doc.text(text, x, y);

        } catch (error) {
            logger.error('ResumePDF/centerText error: ' + error);
        }

    }

    private printHeader() {
        logger.info('ResumePDF/printHeader')
        try {
            this.centerText(this.resumeData.fullName ?? "John Doe", this.yCurrent, this.fontSize_Header + 5, true);
            this.centerText(this.resumeData.location ?? "Location", this.updateY(5), this.fontSize_Header);
            const contactInfo = `${this.resumeData.email ?? "email@example.com"} | ${this.resumeData.phone ?? "123-456-7890"} ${this.resumeData.linkedin ? "| " + this.resumeData.linkedin : ''}`;
            this.centerText(contactInfo, this.updateY(5), this.fontSize_Header);
            this.doc.line(this.margin, this.updateY(2), this.doc.internal.pageSize.width - this.margin, this.yCurrent);
        } catch (error) {
            logger.error('ResumePDF/printHeader error: ' + error);
        }

    }

    private addSectionTitle(title: string) {
        logger.info('ResumePDF/addSectionTitle')
        try {
            this.doc.setFont(this.fontName, "bold");
            this.doc.setFontSize(this.fontSize_SectionTitle);
            this.doc.text(title, this.margin, this.yCurrent);
            this.doc.line(this.margin, this.yCurrent + 2, this.doc.internal.pageSize.width - this.margin, this.yCurrent + 2);
        } catch (error) {
            logger.error('ResumePDF/addSectionTitle error: ' + error);
        }
    }

    private printTitle(
        y: number,
        title: string,
        subtitle: string,
        startDate: Date | null,
        endDate: Date | null,
        isNoEndDate: boolean = false) {
        try {
            logger.info('ResumePDF/printTitle')
            // Title
            this.doc.setFont(this.fontName, "bold");
            this.doc.setFontSize(this.fontSize_Title);
            this.doc.text(title, this.margin, y);
            // Subtitle
            this.doc.setFont(this.fontName, "italic");
            this.doc.setFontSize(this.fontSize_Title - 2);
            this.doc.text(subtitle, this.margin, y + 4);
            // Dates
            this.doc.setFont(this.fontName, "normal");
            // this.doc.setFontSize(xxx); // let date font size same as subtitle (so no change)
            this.doc.text(
                `${this.formatDate(startDate)}  ${isNoEndDate ? '' : '- ' + this.formatDate(endDate)}`,
                this.doc.internal.pageSize.width - this.margin,
                y,
                { align: "right" }
            );
        } catch (error) {
            logger.error('ResumePDF/printTitle error: ' + error);
        }
    }

    private addContent(items: string[], y: number) {
        try {
            logger.info('ResumePDF/addContent')
            // Description or pullet points
            this.doc.setFont(this.fontName, "normal");
            this.doc.setFontSize(this.fontSize_Content);
            let index = 0; // note the index being increased each time with 'this.doc.text'
            items.forEach((item) => {
                var splitItems: string[] = this.doc.splitTextToSize(item, this.maxTextLength);
                if (splitItems.length === 1) {
                    this.doc.text(`• ${item}`, this.margin + 5, y + (index++) * this.ySpacePulletPoints);
                } else {
                    splitItems.forEach((splitItem, splitItemIndex) => {
                        this.doc.text(
                            `${splitItemIndex === 0 ? '•' : ' '} ${splitItem}`,
                            this.margin + 5,
                            y + (index++) * this.ySpacePulletPoints
                        );
                    });
                }
            });
            return y + (index + 1) * this.ySpacePulletPoints;
        } catch (error) {
            logger.error('ResumePDF/addContent error: ' + error);
            return 0;
        }
    }

    private async printBody<T>(
        sectionTitle: string, // The title of the section
        items: T[], // Array of objects to process
        mapFields: MapFieldsFunction<T> // Function to map fields dynamically from each item
    ) {
        logger.info('ResumePDF/printBody')
        try {
            // Add the section title
            this.addSectionTitle(sectionTitle);
            this.updateY(this.ySpaceSectionTitle);

            // Process each item
            for await (const item of items) {
                const { title, subtitle, startDate, endDate, description, isNoEndDate } = mapFields(item);

                // Print the title and subtitle
                this.printTitle(this.yCurrent, title, subtitle, startDate, endDate, isNoEndDate);
                this.updateY(this.ySpaceTitleDescription);

                // Add content and update vertical position
                this.yCurrent = this.addContent(description, this.yCurrent); // Here we relocate y postion directly
                this.updateY(this.ySpaceContents);
            }
        } catch (error) {
            logger.error('ResumePDF/printBody error: ' + error);
        }
    }

    public async generateResumePDF() {
        try {
            logger.info('ResumePDF/generateResumePDF')
            // Header Section        
            this.printHeader()
            this.updateY(this.ySpaceHeaderBody);

            await this.printBody<WorkWithBulletPoints>(
                "Relevant Work",
                this.resumeData.work_history,
                (job: WorkWithBulletPoints) => ({
                    title: job.title,
                    subtitle: job.company,
                    startDate: job.startDate,
                    endDate: job.endDate,
                    description: job.description
                })
            );

            this.updateY(this.ySpaceNweSection);
            await this.printBody<EducationWithBulletPoints>(
                "Education",
                this.resumeData.education_history,
                (edu: EducationWithBulletPoints) => ({
                    title: `${edu.degree} in ${edu.fieldOfStudy}`,
                    subtitle: edu.school,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    description: edu.description
                })
            );

            this.updateY(this.ySpaceNweSection);
            await this.printBody<CertificationWithBulletPoints>(
                "Certifications",
                this.resumeData.certifications,
                (cert: CertificationWithBulletPoints) => ({
                    title: cert.name,
                    subtitle: cert.issuingOrganization,
                    startDate: cert.issueDate,
                    endDate: cert.expirationDate,
                    description: cert.description,
                    isNoEndDate: cert.noExpirationDate
                })
            );
            logger.info('ResumePDF/generateResumePDF: start .save')
            this.doc.save(this.resumeData.outputFileName + '.pdf');
            logger.info('ResumePDF/generateResumePDF: saved')
        } catch (error) {
            logger.error('generateResumePDF error: ' + error);
        }
    }
}
