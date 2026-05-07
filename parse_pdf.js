const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('Full Stack Developer Assignment.pdf');
pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('output.txt', data.text);
    console.log('done');
}).catch(function(error) {
    console.error("Error parsing PDF:", error);
});
