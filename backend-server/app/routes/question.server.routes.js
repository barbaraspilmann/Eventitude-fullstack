const questions = require('../controllers/question.server.controller'); 

module.exports = function(app) {
    app.route('/questions')
        .post(questions.create_question); 
        
    app.route('/questions/:question_id')
        .get(questions.get_question)
        .delete(questions.delete_question);
};