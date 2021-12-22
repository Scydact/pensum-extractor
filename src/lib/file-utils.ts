import FileSaver from 'file-saver';

/**
 * Downloads the given string as a text/json blob (type can be overriden).
 * @param data Blob data to download. Usually a JSON string.
 * @param filename File name, without extension, of the downloaded file. "file"
 * @param ext Extension of the file (with the dot, ".json")
 * @param blobOptions Blob options to include in the blob.
 */
export function download(data: BlobPart, filename: string, ext = '.json', blobOptions: BlobPropertyBag = {
  type: 'data:text/json;charset=utf-8'
}) {
  var blob = new Blob([data], blobOptions);
  FileSaver.saveAs(blob, filename + ext);
}

/**
 * Prompts the user to upload a single file.
 * @param accept Extensions of files to accept.
 * @returns 
 */
export function upload(accept = '.json') {
  return new Promise((resolve: (value: string | ArrayBuffer | null) => any, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.click();
    input.addEventListener('change', () => {

      if (!input) {
        reject('Unable to find <input>');
        return;
      }
      if (!input.files) {
        reject('No file was selected');
        return;
      }

      const file = input.files[0];
      
      if (!file) {
        reject('No file was specified. This error should never occur.');
        return;
      }

      const filename = input.files[0]['name'];

      let reader = new FileReader();
      reader.onload = async (f) => {
        try {
          let txt = f.target?.result || null;
          resolve(txt);
        } 
        catch (e) {
          reject(`Unable to load file '${filename}':\n ${e}`)
        }
      };
      reader.readAsText(input.files[0]);
    });
  })
}