/**
 * Company <-- 1:M --> Recruiter
 * Recruiter <-- 1:M --> JobPost
 * JobSeeker <-- 1:M --> Education
 * JobSeeker <-- 1:M --> Work
 * JobSeeker <-- 1:M --> Certification
 * --------------------------
 * [X] JobSeeker <-- M:M --> JobPost ==> OpportunityResults (New model from many-many relationship)
 * JobSeeker <-- 1:M --> OpportunityResults
 * JobPost <-- 1:M --> OpportunityResults
 */

import Certification from "./certificationModel";
import Company from "./companyModel";
import Education from "./educationModel";
import JobPost from "./jobPostModel";
import JobSeeker from "./jobSeekerModel";
import OpportunityResults from "./opportunityResultsModel";
import Recruiter from "./recruiterModel";
import Work from "./workModel";

const setupDb = () => {
    // Company <-- 1:M --> Recruiter
    Company.hasMany(Recruiter, { foreignKey: 'companyId' });
    Recruiter.belongsTo(Company, { foreignKey: 'companyId' });

    // Recruiter <-- 1:M --> JobPost
    Recruiter.hasMany(JobPost, { foreignKey: 'recruiterId' });
    JobPost.belongsTo(Recruiter, { foreignKey: 'recruiterId' });

    // JobSeeker <-- 1:M --> Education
    JobSeeker.hasMany(Education, { foreignKey: 'jobSeekerId' });
    Education.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });

    // JobSeeker <-- 1:M --> Work
    JobSeeker.hasMany(Work, { foreignKey: 'jobSeekerId' });
    Work.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });

    // JobSeeker <-- 1:M --> Certification
    JobSeeker.hasMany(Certification, { foreignKey: 'jobSeekerId' });
    Certification.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });

    // JobSeeker <-- 1:M --> OpportunityResults
    JobSeeker.hasMany(OpportunityResults, { foreignKey: 'jobSeekerId' });
    OpportunityResults.belongsTo(JobSeeker, { foreignKey: 'jobSeekerId' });

    // JobPost <-- 1:M --> OpportunityResults
    JobPost.hasMany(OpportunityResults, { foreignKey: 'jobPostId' });
    OpportunityResults.belongsTo(JobPost, { foreignKey: 'jobPostId' });
}

export default setupDb;