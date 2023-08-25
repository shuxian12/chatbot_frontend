import axios from "axios";
export const messageService = {
  createMessage
}

function getCitationFilePath(citation) {
return axios.defaults.baseURL + `/content/${citation}`;
}

function createMessage (message, data_points=[], citations=[]) {
    // if (citations !== []) {
    //     const options = []
    //     citations.forEach(function(file_name, i) {
    //         options.push({
    //             'text': `${i+1}. ${file_name}`,
    //             'value': getCitationFilePath(file_name),
    //             'action': 'url'
    //         })
    //     })

    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve({
    //                 'type': 'button',
    //                 'text': message,
    //                 'options': options,
    //             })
    //         }, 0)
    //     })
    // }
    // else {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve({
    //                 'type': 'text',
    //                 'text': message,
    //             })
    //         }, 0)
    //     })
    // }

    if (data_points === [] && citations === []) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    'type': 'text',
                    'text': message,
                })
            }, 0)
        })
    }

    const options = []
    if (citations !== []) {
        citations.forEach(function(file_name, i) {
            options.push({
                'text': `${i+1}. ${file_name}`,
                'value': getCitationFilePath(file_name),
                'action': 'url'
            })
        })
    }

    const dps = new Set()
    data_points.forEach(function(dp) {
        dps.add(dp.split(':')[0])
    })
    console.log(dps)
    let i = 0
    dps.forEach(function(data_point) {
        console.log(data_point)
        console.log(i)
        options.push({
            'text': `Search Data ${++i}. ${data_point}`,
            'value': getCitationFilePath(data_point),
            'action': 'url'
        })
    })

    console.log(options)

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
