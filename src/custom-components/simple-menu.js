import React, { Component } from 'react';
import '../css/simple-menu.css';
export default class SimpleMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        return (
            <div className='menu'>
                <div className='title'>Welcome to Simple Video Player</div>
                {this.props.children}
            </div>
        );
    }
}