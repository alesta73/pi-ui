Docker: 
docker stop pi-ui
docker start pi-ui

Build in linux terminal: docker compose up -d --build //funkar enbart om container skapades med samma kommando, 
annars får man ta bort containern först med rm -f <containernamn>

For dev in localhost: 2 terminals: 
node server.js
npm run dev