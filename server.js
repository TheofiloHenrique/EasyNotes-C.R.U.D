import express from 'express'
import db from './database.js'

const app = express()
app.use(express.json())
app.use(express.static('public'))
const port = 3000;

//ROTA GET
app.get('/notes', (req,res) =>{
    const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC').all()
    res.json(notes)
})

//ROTA GET COM PARAMS
app.get('/notes/:id', (req,res) =>{
    const id = Number(req.params.id)

    const note = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(id);

    if (!note) return res.status(404).json({ error: 'Nota No Encontrada!'});
    
    res.json(note);
})

//ROTA POST
app.post('/notes',(req,res)=>{
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            error: 'Título y contenido son obligatorios'
        });
    }

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

    if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            error: 'Título y contenido son obligatorios'
        });
    }

    const result = db.prepare(`
        UPDATE notes
        SET title = ?, content = ?
        WHERE id = ?
    `).run(title, content, id)

    if (result.changes === 0) return res.status(404).json({error: 'Nota No Encontrada!'});
    
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

    if (result.changes === 0) return res.status(404).json({error: 'Nota No Encontrada!'})
    
    res.status(204).send()
})

app.listen(port, () => console.log(`Motores conectados en la puerta ${port}! xD`))
