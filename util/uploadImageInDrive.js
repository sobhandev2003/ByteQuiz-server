
const { google } =require( "googleapis");
const fs = require('fs');
const { Readable } = require("stream");


//Check file path exists or not


//NOTE -   configure google OAuth2  authentication
 const googleDriveOauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_API_CLIENT_ID,
  process.env.GOOGLE_DRIVE_API_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_API_REDIRECT_URL
);


googleDriveOauth2client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_API_REFRESH_TOKEN
});

//NOTE - Give google drive authorization
 const googleDrive = google.drive({
  version: 'v3',
  auth: googleDriveOauth2client,
})


//SECTION - upload image in drive

 const uploadImageInGoogleDrive = async (
  fileName,
  mimeType,
  buffer ,
  parentsId ,
  profilePhotoId ) => {
    // console.log(googleDrive.permissions);
  try {


// console.log("ch1");
    //NOTE - If Pervious profile photo exit then Delete this photo
    // if (profilePhotoId !== null) {
    //   await googleDrive.files.delete({
    //     fileId: `${profilePhotoId}`
    //   })
    // }
    // Convert the image buffer to a readable stream
    const imageStream = new Readable();
    imageStream.push(buffer);
    imageStream.push(null); // Indicates the end of the stream
    
    //NOTE - Upload new Profile photo in drive
    const response = await googleDrive.files.create({
      requestBody: {
        name: `${fileName}`,
        mimeType: `${mimeType}`,
        parents: [`${parentsId}`],
      },
      media: {
        mimeType: `${mimeType}`,
        body: imageStream
      }
    })
    // console.log("ch2");

    const fileId = response.data.id;
    if (!fileId || typeof fileId === "undefined") {
      throw new Error("Some thing wrong")
    }

    //NOTE - Give permission to Viewer anyone
    await googleDrive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    })
    // console.log("ch1");
  
  

    //NOTE - Return file Id.
    return fileId;

  } catch (error) {
    // console.error(error);
    throw new Error("Internal server Error")
  }
}

module.exports={uploadImageInGoogleDrive,googleDrive}