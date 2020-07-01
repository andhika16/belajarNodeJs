const Joi = require('joi');
const express = require('express');
const app = express();



const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' }
]


app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!!!')
})



app.get('/api/courses', (req, res) => {
    res.send(courses);
});


app.get('/api/courses/:id', (req, res) => {
    const course = notFound(req.params.id, res);
    res.send(course);
})


app.post('/api/courses/', (req, res) => {



    const { error } = validateCourse(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const course = {
        id: courses.length + 1,
        name: req.body.name
    }

    courses.push(course);
    res.send(course)

});

app.put('/api/courses/:id', (req, res) => {
    //  look up the courses
    // if not exsisting , 404 Not Found

    const course = notFound(req.params.id, res);
    // validate
    // if invalid return 400 bad request
    const { error } = validateCourse(req.body)
    if (error) return res.status(400).send(error.details[0].message);


    // update coures
    course.name = req.body.name;
    res.send(course)
    // return update
})

app.delete('/api/courses/:id', (req, res) => {

    const course = notFound(req.params.id, res);
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);

})

function validateCourse(course) {
    // validation function
    const schema = {
        name: Joi.string().min(3).required()
    }

    return Joi.validate(course, schema);
}

function notFound(req, res) {
    // notFound handler function
    const course = courses.find(c => c.id === parseInt(req));
    if (!course) {
        res.status(404).send('The course with given Id is not found')
    };

    return course;

}


const port = process.env.port || 3000
app.listen(port, () => console.log(`listening on port ${port}`))





