import express, { json } from 'express'

const app = express()

app.use(express.json())

const notes = [{
    id:1,
    title:"First note",
    content:"Agora sim estamos vendo algo que digitei aqui que ninguem liga pqp",
}]
const port = 3000;

//GET
app.get('/notes', (req,res) =>{
    res.json(notes)
})

//GET PARAMS
app.get('/notes/:id', (req,res) =>{
    const id = Number(req.params.id)
    const noteId = notes.find(note => note.id === id)

    res.json(noteId)
})

//POST
app.post('/notes',(req,res)=>{
    const note = 
    {
        id: notes.length + 1,
        title: req.body.title,
        content: req.body.content,
    }

    notes.push(note)
    res.json(note)
})

//PUT
app.put('/notes/:id', (req, res) =>{
    const id = Number(req.params.id)
    const noteId = notes.find(note => note.id === id)

    noteId.title = req.body.title
    noteId.content = req.body.content

    res.json(noteId)
})

//DELETE
app.delete('/notes/:id', (req, res) => {
    const id = req.params.id
    const noteIndex = notes.findIndex(note => note.id === id)

    notes.splice(noteIndex, 1)
    res.send("Nota excluida")
})

app.listen(port, () => console.log(`Motores ligados na porta ${port}! xD`))
