const mongoose = require('mongoose');
const path = require('path');
const { readFile, writeFile } = require('fs');
const { parseJsonToObject } = require('../../src/utils/objectFormatter');
const JurisdictionModel = require('../../src/models/lawyer/jurisdiction');
const PracticeAreaModel = require('../../src/models/practicearea/practiceArea');
const LawyerJurisdictionModel = require('../../src/models/lawyer/lawyerJurisdiction');
const LawyerPracticeAreaModel = require('../../src/models/lawyer/lawyerPracticeArea');
const LawyerModel = require('../../src/models/lawyer/lawyer');
const UserModel = require('../../src/models/auth/users');
const ClientModel = require('../../src/models/client/client');
const { createClientUser } = require('../../src/services/authService');
const lawyerService = require('../../src/services/lawyerService');
const JurisdictionFilePath = path.join(__dirname, "\\configfiles\\jurisdictions.json");
const uuid = require('uuid').v4;


const OldUserFilePath = path.join(__dirname, '\\configfiles\\oldUsers.json');
const oldClientPath = path.join(__dirname, '\\configfiles\\oldclients.json');
const newFilePath = path.join(__dirname, '\\configfiles\\newClient.json')
const newUserFilePath = path.join(__dirname, '\\configfiles\\newUser.json')


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
    let lawyerObj = userObj;
    lawyerObj = { ...lawyerObj, public_id: publicId, user_type: 'lawyer', email_address: 'lawyer1@test.com' };
    UserModel.findOne({ email_address: 'lawyer1@test.com' }).then(found => {
        if (!found) {
            UserModel.create(lawyerObj).then(result => {
                LawyerModel.create(lawyerObj).then(createdLawyer => {
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
                });
            });
        }
    }).catch(err => {

    });

};


const seedProductionDb = () => {
    var userArray = [];
    readFile(OldUserFilePath, 'utf-8', (err, oldUsers) => {
        if (!err) {
            readFile(oldClientPath, 'utf-8', (err, oldClients) => {
                if (!err) {
                    let tempUserArray = JSON.parse(oldUsers);
                    let tempClient = JSON.parse(oldClients);
                    let newUsers = tempUserArray.map(x => {
                        let index = tempClient.findIndex(y => y.public_id === x.public_id);
                        if(index > -1){
                            let publicId = mongoose.Types.ObjectId(uuid().substr(0,12));
                            tempClient[index].public_id = publicId;
                            
                            return {...x, ...tempClient[index], public_id : publicId};
                        }else{
                            return null;
                        }
                    });

                    // writeFile(newFilePath, JSON.stringify(newUsers), 'utf-8',(err) =>{
                    //     if(err){
                    //         console.log("error occured", err);
                    //     }else{
                    //         console.log("success writing file");
                    //     }
                    // } )
                    // writeFile(newUserFilePath, JSON.stringify(tempClient), 'utf-8',(err) =>{
                    //     if(err){
                    //         console.log("error occured", err);
                    //     }else{
                    //         console.log("success writing file");
                    //     }
                    // } )

                        // UserModel.create(newUsers);
                        
                        // ClientModel.create(newUsers).then(result => {

                        // }).catch(err => {
                        //     console.log("error gotten", err);
                        // }) ;

                }
            });
        }
    });
};

// seedProductionDb();


// seedPracticeArea();
// seedJurisdiction();
// seedClient();
// seedLawyer();