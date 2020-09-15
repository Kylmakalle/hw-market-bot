const fetch = require('node-fetch');
const { BOT_TOKEN } = process.env;

export async function fetchPhoto(photoId) {
    const photoInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${photoId}`
    const photoInfoResponse = await fetch(photoInfoUrl)

    let fetchedPhoto;
    if (photoInfoResponse.ok) {
        const { result: { file_path: filePath } } = await photoInfoResponse.json();
        const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
        fetchedPhoto = await fetch(photoUrl)
    }
    return fetchedPhoto
}