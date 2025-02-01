import sequelize from '../config/database';
import Company from './companyModel';
import Recruiter from './recruiterModel';
import JobPost from './jobPostModel';
import JobSeeker from './jobSeekerModel';
import Education from './educationModel';
import Work from './workModel';
import Certification from './certificationModel';
import OpportunityResults from './opportunityResultsModel';
import './associations'; // Import associations to ensure they are set up


Company.initModel(sequelize);
Recruiter.initModel(sequelize);
JobPost.initModel(sequelize);
JobSeeker.initModel(sequelize);
Education.initModel(sequelize);
Work.initModel(sequelize);
Certification.initModel(sequelize);
OpportunityResults.initModel(sequelize);

export {
    sequelize,
    Company,
    Recruiter,
    JobPost,
    JobSeeker,
    Education,
    Work,
    Certification,
    OpportunityResults,
};
