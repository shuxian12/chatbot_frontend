import axios from "axios";
export const messageService = {
  createMessage
}

function getCitationFilePath(citation) {
return axios.defaults.baseURL + `/content/${citation}`;
}

function createMessage (message, citations=[]) {
    if (citations !== []) {
        const options = []
        citations.forEach(function(file_name, i) {
            options.push({
                'text': `${i+1}. ${file_name}`,
                'value': getCitationFilePath(file_name),
                'action': 'url'
            })
        })

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    'type': 'button',
                    'text': message,
                    'options': options,
                })
            }, 0)
        })
    }
    else {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    'type': 'text',
                    'text': message,
                })
            }, 0)
        })
    }
}
