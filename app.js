/*******************************************************************
 * Programme en ligne de commande prenant un fichier contenant
 * une liste de description de transaction en entrée et retourne
 * des informations pertinante pour chaque description sous
 * format JSON.
 * -----------------------------------------------------------------
 * Utilisation :
 *  node app [-i <relative file path>] [-o <relative file path>]
 *
 * Où "-i" est le fichier d'entré et "-o" est le fichier de sortie.
 * Le chemin du fichier de sortie doit existé ou le programme
 * lancera une exception.
 *
 * Exemple :
 * node app -i sample.txt -o result.json
 *******************************************************************/

const Path = require('path');
const fs = require('fs');



class App {
    /**
     * @param {string[]} args
     */
    static async analyse(args) {
        let inputPath;
        let outputPath;
        let inputFile = 'sample.txt';
        let outputFile = 'result.json';

        if (args.includes('-i')) {
            let argIndex = args.indexOf('-i');

        }
        if (args.includes('-o')) {

        }

        inputPath = Path.join(__dirname, inputFile);
        if (!fs.existsSync(inputPath)) {
            console.error('Le chemin du fichier d\'entré n\'existe pas.');
            return;
        }
        outputPath = Path.join(__dirname, outputFile);
        let outputInfo = Path.parse(outputPath);
        if (!fs.existsSync(outputInfo.dir)) {
            console.error('Le chemin du fichier de sortie n\'existe pas.');
            return;
        }

        let descriptions = fs.readFileSync(inputPath, { encoding: 'utf-8' }).split('\n');

        const ner = require('ner');
        const nerClient = new ner({ post: 65000, host: 'localhost' });
        nerClient.get(descriptions[0], (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(res);
        });
    }
}



App.analyse(process.argv).catch(console.error);