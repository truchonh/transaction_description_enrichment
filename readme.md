# Module d'enrichissement de description de transaction bancaire en parallèle utilisant le "Stanford Named Entity Recognizer (NER)"
Projet final du cours IFT630

## Fonctionalitée
Une description de transaction bancaire est passé en entré au module et un document JSON est retourné avec des informations sur chaque entité trouvé dans la chaine d'entré.

## Aspect de parallélisme
Le programme principal sera écrit en javascript et la coordination des sous-programmes sera gérer de façon asynchrone.

Les tâches à exécuter sont les suivantes:
- [1] Détection des entités avec le NER
- [2] Récupération des données local sur les entitées connue
- [3] Recherche d'information sur les entitées non connue avec l'api de recherche de DuckDuckGo

### Traitement en batch
Les traitements seront divisé en deux 'pool'. Le premier...

## Exemple d'entré / sortie
description: "AMZN Mktp CA*M656S0FL2 WWW.AMAZON.CAON"

entitées: ["Amazon"]

```
reponse: {
  "amazon": {
    "type": "entreprise",
    "description": "Amazon.com, Inc. (NASDAQ : AMZN7) est une entreprise de commerce électronique nord-américaine basée à Seattle. Elle est un des géants du Web, regroupés sous l'acronyme GAFAM8, aux côtés de Google, Apple, Facebook et Microsoft."
  }
}
```

## Idée générale de l'algorithme principal
```
/*******************************************************************************
Algorithme naif pour l'extraction d'information.

À noter que tout le traitement est séquentiel et pour traiter plusieurs 
description, il faut appeler la fonction plusieurs fois séquentiellement.
*******************************************************************************/

function parseDescription(description) {
  // Pré-traitement pour retirer les numéros de sucursale, no de téléphone, et
  // autre pattern récurant qui ne sont pas pertinant.
  let processedDescription = preProcess(description);

  // Appel à l'IA (Stanford Named Entity Recognizer).
  let entities = NER.parse(processedDescription);

  // Récupération des informations de la bdd ou du web.
  for (let entity of entities) {
    if (entity.type === 'organization') {
      let dbInfo = db.organization.find(entity.name);
      
      if (dbInfo === null) {
        let webInfo = duckDuckGo.search(entity.name);
        db.organization.insert(webInfo);
        return webInfo;
      } else {
        return dbInfo;
      }
    }
  }
}
```
