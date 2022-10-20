import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Homepage from './Homepage';
import Error from './Error';


class App extends Component {

    render() {        
             
        return (
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/error" element={<Error />} />
                        <Route path="/:level1" element={<Homepage />} />
                        <Route path="/:level1/:level2" element={<Homepage />} />
                        <Route path="/:level1/:level2/:level3" element={<Homepage />} />
                        <Route path="/:level1/:level2/:level3/:level4" element={<Homepage />} />
                        <Route path="/:level1/:level2/:level3/:level4/:level5" element={<Homepage />} />
                    </Routes>
                </BrowserRouter>
        );
    }
};


export default App;
