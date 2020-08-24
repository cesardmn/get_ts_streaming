const Fs = require('fs')
const Path = require('path')
const axios = require('axios');
const shell = require('shelljs');
const readlineSync = require('readline-sync');

const baseUrl = readlineSync.question('URL: ')

const name_video = readlineSync.question('Video name: ')

async function main() {

  let status = 200
  let i = 0

  while (status == 200) {
    i += 1

    let url = baseUrl.replace(/seg-\d+-/, `seg-${i}-`)
    let fileName = `${('0000' + i).slice(-4)}.ts`

    status = await getFrame(url, fileName)

  }

  renderVideo()
}

async function getFrame(url, fileName) {
  try {
    let response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    const path = Path.resolve(__dirname, 'saved_files', '.tmp', `${fileName}`)
    const writer = Fs.createWriteStream(path)
    response.data.pipe(writer)

    console.log(`[get frame] ===> ${fileName}`)

    return 200

  } catch (error) {
    return 400
  }
}


function renderVideo() {

  const cmd = `
    echo "Rendering frames to ${name_video}.mp4 ..." &&
    echo '' > mylist.txt &&
    for f in ./saved_files/.tmp/*.ts; do echo "file '$f'" >> mylist.txt; done &&
    ffmpeg -loglevel quiet -f concat -safe 0 -i mylist.txt -c copy ./saved_files/"${name_video}".mp4 -y &&
    echo '' > mylist.txt &&
    rm -rf ./saved_files/.tmp/*ts
    rm mylist.txt &&
    echo "Saved:  ${Path.resolve(__dirname, 'saved_files', `${name_video}.mp4`)}"
  `

  shell.exec(cmd)

}

main()
