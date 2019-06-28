# Module d'enrichissement de description de transaction bancaire en parallèle utilisant le "Stanford Named Entity Recognizer (NER)"
Projet final du cours IFT630

## Mise en contexte
L'objectif de ce projet est de réaliser un algorithme qui prend en entrée des descriptions de transactions bancaire (telles qu'ils apparaissent sur un relevé de carte de guichet / carte de crédit) et retourne à l'utilisateur des informations pertinantes extraite de ces descriptions (infos sur l'entreprise, numéro de sucursale, numéro de téléphone). Cette algorithme sera principalement appelé avec des lots de données (typiquement 10 à 50 entrées unique) et le tout devra se faire en temps réel.

Pour ce faire, l'algorithme combinera les résultats de deux outils : 
- Le Stanford Named Entity Recognizer, un programme utilisant l'intelligense artificiel pour reconnaitre des entitées (entreprise, lieu, personne) dans une chaine de texte.
- L'api de recherche de DuckDuckGo, qui permet d'obtenir des snippets d'information de sources variées pour des entitées connues.

L'utilisation des concepts de parallélisme seront centré sur ces deux outils. Le premier utilisant beaucoup de temps CPU poura être distribué sur plusieurs thread et le deuxième nécessite l'attente de la réponse de l'api et pourra être géré à l'aide de promesse Javascript.

## Problèmes potentiels


## Description des hypothèses


## Aspect de parallélisme en détail
Le programme principal sera écrit en javascript et la coordination des sous-programmes sera gérer de façon asynchrone.

Les tâches à exécuter sont les suivantes:
- [1] Détection des entités avec le NER
- [2] Récupération des données local sur les entitées connue
- [3] Recherche d'information sur les entitées non connue avec l'api de recherche de DuckDuckGo

### Traitement en batch
Les deux étapes les plus couteuse en traitement/temps sont [1] l'appel au NER et [3] la requête au moteur de recherche DuckDuckGo. 

L'idée est de diviser les traitements en deux file d'attente et de wrapper chaque description de transaction dans un objet Job qui progressera d'une file à l'autre. D'abord, un certain nombre de worker feront les appels au NER et placeront au fur et à mesure les résultats dans la seconde file. Dans le thread principal, à mesure que des éléments sont ajouté à la 2ieme file de traitement, des appels à l'api DuckDuckGo seront effectué de façon asynchrone avec des promesses Javascript. Voir le diagramme ci-bas.

[diagrame draw.io des traitements parallèles]



## Exemple d'entré / sortie
description: "AMZN Mktp CA*M656S0FL2 WWW.AMAZON.CAON"

entitées: ["Amazon"]

```json
reponse: {
  "amazon": {
    "type": "entreprise",
    "description": "Amazon.com, Inc. (NASDAQ : AMZN7) est une entreprise de commerce électronique nord-américaine basée à Seattle. Elle est un des géants du Web, regroupés sous l'acronyme GAFAM8, aux côtés de Google, Apple, Facebook et Microsoft."
  }
}
```

## Idée générale de l'algorithme principal
```javascript
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
