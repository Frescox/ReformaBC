const respuestas = {
    "info": {
        respuesta: "En estas elecciones, por primera vez, las personas podrán votar directamente para elegir a jueces y magistrados.\n\nEsto busca que el sistema judicial sea más transparente, justo y cercano a la ciudadanía de acuerdo a las necesidades y expectativas de la sociedad.",
        opciones: [
            {texto: "🗳️ ¿Cuántos cargos se eligen?", valor: "cargos"},
            {texto: "⚖️ Sistema judicial en México", valor: "sistema"}
        ]
    },
    "cargos": {
        respuesta: "En total, se elegirán 171 cargos judiciales:\n\n24 magistrados:\n• 16 numerarios\n• 3 supernumerarios del Tribunal Superior de Justicia\n• 1 especializado en Justicia para Adolescentes\n• 3 numerarios y 1 supernumerario del Tribunal de Disciplina Judicial\n\n147 jueces distribuidos en los siete partidos judiciales de los municipios del estado",
        opciones: [
            {texto: "👨‍⚖️ ¿Qué hace un magistrado?", valor: "magistrado"},
            {texto: "👩‍⚖️ ¿Qué hace un juez?", valor: "juez"}
        ]
    },
    "sistema": {
        respuesta: "El sistema judicial mexicano se organiza en varios niveles:\n\n• Suprema Corte de Justicia de la Nación (SCJN): Máximo órgano judicial\n\n• Tribunales colegiados y unitarios: Resuelven apelaciones\n\n• Juzgados de distrito: Atienden casos en primera instancia\n\n• Tribunales estatales: Resuelven asuntos locales\n\n• Tribunales especializados: Atienden temas específicos",
        opciones: [
            {texto: "👨‍⚖️ Funciones de magistrados", valor: "magistrado"},
            {texto: "👩‍⚖️ Funciones de jueces", valor: "juez"}
        ]
    },
    "magistrado": {
        respuesta: "Un magistrado revisa y resuelve apelaciones, es decir, analiza si una decisión tomada por un juez fue correcta o necesita modificarse.\n\nSu función es garantizar la justicia en niveles más altos del sistema judicial.",
        opciones: [
            {texto: "👩‍⚖️ ¿Qué hace un juez?", valor: "juez"},
            {texto: "⚖️ Tipos de Derecho", valor: "derecho"}
        ]
    },
    "juez": {
        respuesta: "Un juez toma decisiones legales en casos específicos.\n\nEscucha a las partes involucradas, revisa las pruebas y dicta sentencias basadas en las leyes aplicables.",
        opciones: [
            {texto: "👨‍⚖️ ¿Qué hace un magistrado?", valor: "magistrado"},
            {texto: "⚖️ Tipos de Derecho", valor: "derecho"}
        ]
    },
    "derecho": {
        respuesta: "Tipos de Derecho:\n\n• Civil: Relaciones entre personas\n\n• Mercantil: Relaciones comerciales\n\n• Hipotecario: Bienes inmuebles y deudas\n\n• Familiar: Divorcios, custodia, adopciones\n\n• Laboral: Conflictos laborales\n\n• Oralidad penal: Audiencias orales\n\n• Penal tradicional: Procedimientos escritos\n\n• Justicia para adolescentes: Delitos de menores\n\n• Violencia familiar contra mujeres: Protección y castigo",
        opciones: [
            {texto: "🗳️ Requisitos para votar", valor: "requisitos"},
            {texto: "ℹ️ Información general", valor: "info"}
        ]
    },
    "requisitos": {
        respuesta: "Para ir a votar necesitas:\n\n• Credencial para votar emitida por el INE y vigente\n\n• Conocer tu casilla de votación\n\n• Asistir el día de la elección dentro del horario establecido\n\n• Opcional: Revisar previamente las propuestas de los candidatos",
        opciones: [
            {texto: "🗳️ ¿Cuántos cargos se eligen?", valor: "cargos"},
            {texto: "ℹ️ Información general", valor: "info"}
        ]
    }
};

function showTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    indicator.style.display = 'flex';
}

function hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    indicator.style.display = 'none';
}

function addMessage(message, isUser = false) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // Reemplazar \n por <br> para crear saltos de línea HTML
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    
    chatBox.insertBefore(messageDiv, document.querySelector('.typing-indicator'));
    return messageDiv;
}

function addQuickReplies(messageDiv, opciones) {
    if (opciones && opciones.length > 0) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';
        opciones.forEach(opcion => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = opcion.texto;
            button.onclick = () => handleQuickReply(opcion.valor);
            quickRepliesDiv.appendChild(button);
        });
        messageDiv.appendChild(quickRepliesDiv);
    }
}

function handleQuickReply(valor) {
    const respuesta = respuestas[valor];
    if (respuesta) {
        addMessage(valor, true);
        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            const messageDiv = addMessage(respuesta.respuesta);
            addQuickReplies(messageDiv, respuesta.opciones);
            scrollToBottom();
        }, 1000);
    }
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const mensaje = userInput.value.trim().toLowerCase();

    if (mensaje === '') return;

    addMessage(userInput.value, true);
    showTypingIndicator();
    
    let respuestaEncontrada = false;
    for (let key in respuestas) {
        if (mensaje.includes(key)) {
            setTimeout(() => {
                hideTypingIndicator();
                const messageDiv = addMessage(respuestas[key].respuesta);
                addQuickReplies(messageDiv, respuestas[key].opciones);
                scrollToBottom();
            }, 1000);
            respuestaEncontrada = true;
            break;
        }
    }

    if (!respuestaEncontrada) {
        setTimeout(() => {
            hideTypingIndicator();
            const messageDiv = addMessage("Disculpa, no he entendido tu pregunta. ¿Podrías reformularla? Aquí hay algunos temas sobre los que puedo ayudarte:");
            addQuickReplies(messageDiv, [
                {texto: "ℹ️ Información general", valor: "info"},
                {texto: "🗳️ Cargos a elegir", valor: "cargos"},
                {texto: "⚖️ Sistema judicial", valor: "sistema"},
                {texto: "🗳️ Requisitos para votar", valor: "requisitos"}
            ]);
            scrollToBottom();
        }, 1000);
    }

    userInput.value = '';
}

function scrollToBottom() {
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});