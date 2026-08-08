import express, { json } from 'express'
import db from './database.js'

const app = express()
app.use(express.json())
const port = 3000;

//ROTA GET
app.get('/notes', (req,res) =>{
    const notes = db.prepare('SELECT * FROM notes').all()
    res.json(notes)
})

//ROTA GET COM PARAMS
app.get('/notes/:id', (req,res) =>{
    const id = Number(req.params.id)

    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(id);

    if (!note) return res.status(404).json({ error: 'Note Not Found!'});
    
    res.json(note);
})

//ROTA POST
app.post('/notes',(req,res)=>{
    const { title, content } = req.body;

    const result = db.prepare(`
        INSERT INTO notes (title, content)
        VALUES (?, ?)
    `).run(title, content)

    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(result.lastInsertRowid)

    res.status(201).json(note)
})

//ROTA PUT
app.put('/notes/:id', (req, res) =>{
    const id = Number(req.params.id);
    const { title, content } = req.body;

    const result = db.prepare(`
        UPDATE notes
        SET title = ?, content = ?
        WHERE id = ?
    `).run(title, content, id)

    if (result.changes === 0) return res.status(404).json({error: 'Note Not Found'});
    
    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(id);

    res.json(note);
})

//ROTA DELETE
app.delete('/notes/:id', (req, res) => {
    const id = Number(req.params.id)

    const result = db.prepare(`
        DELETE FROM notes WHERE id = ?
    `).run(id)

    if (result.changes === 0) return res.status(404).json({error: 'Nota não encontrada'})
    
    res.status(204).send()
})

app.listen(port, () => console.log(`Motores ligados na porta ${port}! xD`))
