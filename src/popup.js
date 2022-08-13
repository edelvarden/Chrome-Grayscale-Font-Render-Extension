import React from 'react';
import { render } from 'react-dom';

function Popup() {
    return (
        <>
            <h1>Title</h1>
            <p>Some text</p>
        </>
    );
}

render(<Popup />, document.getElementById('root'));
