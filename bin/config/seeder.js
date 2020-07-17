const mongoose = require('mongoose');
const path = require('path');
const { readFile } = require('fs');
const { parseJsonToObject } = require('../../src/utils/objectFormatter');
const JurisdictionModel = require('../../src/models/lawyer/jurisdiction');
const PracticeAreaModel = require('../../src/models/practicearea/practiceArea');
const LawyerJurisdictionModel = require('../../src/models/lawyer/lawyerJurisdiction');
const LawyerPracticeAreaModel = require('../../src/models/lawyer/lawyerPracticeArea');
const LawyerModel  = require('../../src/models/lawyer/lawyer');
const UserModel = require('../../src/models/auth/users');
const { createClientUser } = require('../../src/services/authService');
const lawyerService = require('../../src/services/lawyerService');
const JurisdictionFilePath = path.join(__dirname, "\\configfiles\\jurisdictions.json");

let userObj = {
    first_name: "John",
    last_name: "Doh",
    name: "John Doh",
    email_address: "client@test.com",
    password: 123456,
    user_type: 'client',
    terms_accepted: true,
    is_complete: true,
    phone_number: 123456789
};

const seedPracticeArea = () => {
    let PracticeAreaString = "Land,Criminal,Bio";
    let practiceAreaArray = PracticeAreaString.split(",").map(x => ({ name: x }));
    PracticeAreaModel.estimatedDocumentCount((err, result) => {
        if (err) {
            process.exit(0);
        } else if (result <= 0) {
            PracticeAreaModel.create(practiceAreaArray);
        }
    });

};

const seedJurisdiction = () => {
    let JurisdictionArrayObject = [];
    JurisdictionModel.estimatedDocumentCount((err, result) => {
        if (err) {
            process.exit(0);
        } else if (result <= 0) {
            readFile(JurisdictionFilePath, 'utf-8', (err, result) => {
                JurisdictionArrayObject = parseJsonToObject(result);
                JurisdictionModel.create(JurisdictionArrayObject).then(result => { console.log("result", result); }).catch(err => { });
            });
        }
    });
};
const seedClient = () => {
    UserModel.estimatedDocumentCount((err, result) => {
        if (err) {
            process.exit(0);
        } else if (result <= 0) {
            UserModel.create(userObj).then(result => {
                createClientUser(userObj);
            });
        }
    });
};
const seedLawyer = () => {
    let publicId = mongoose.Types.ObjectId();
    let lawyerObj = userObj
    lawyerObj = { ...lawyerObj, public_id: publicId, user_type: 'lawyer', email_address: 'lawyer1@test.com' };
    UserModel.findOne({ email_address: 'lawyer1@test.com' }).then(found => {
        if (!found) {
            UserModel.create(lawyerObj).then(result => {
                LawyerModel.create(lawyerObj).then(createdLawyer =>{
                    PracticeAreaModel.find().limit(5).then(area => {
                        JurisdictionModel.find().limit(5).then(jurs => {
                            let practiceAreaIds = area.map(x => ({
                                user: result.id,
                                public_id: publicId,
                                practice_area: x.id
                            }));
                            let jurisdictionData = jurs.map(x => ({
                                jurisdiction_id: x.id,
                                enrolment_number: 111111111111,
                                year: 2004,
                                public_id: publicId
                            }));
    
                            LawyerPracticeAreaModel.create(practiceAreaIds);
                            LawyerJurisdictionModel.create(jurisdictionData);
                        });
                    });
                })
            });
        }
    }).catch(err => {

    });

};





seedPracticeArea();
seedJurisdiction();
seedClient();
seedLawyer();