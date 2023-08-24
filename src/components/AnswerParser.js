// /**
//  *
//  * @param {string} answer
//  * @returns {{
//  *    citations: Array,  // citation name in order
//  *    citationIndex: {},  // citation name to index
//  *    citationOrder: Array // list of citation index of citations in order
//  *    citationAndContext: Array, // citation name and context in order
//  * }}
//  */
// export function parseAnswerToCitation(answer) {
//     const citations = [];
//     const citationIndex = {};
//     var i = 1;
//     const parts = answer.trim().split(/\[([^\]]+)\]/g);

//     const fragments = parts.map((part, index) => {
//         if (index % 2 === 0) {
//             return part;
//         }

//         if (index % 2 === 1) {
//             citations.push(part);
//             if (citationIndex.hasOwnProperty(part)) {
//                 return part;
//             } else {
//                 citationIndex[part] = i++;
//                 return part;
//             }
//         }
//     });

//     if (fragments[fragments.length - 1] === '') {

//     return {
//         citations: citations,
//         citationIndex: citationIndex,
//         citationOrder: citations.map(citation => citationIndex[citation]),
//         citationAndContext: fragments
//     }
// }
