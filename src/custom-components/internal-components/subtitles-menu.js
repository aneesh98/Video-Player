import React from 'react';
import './custom-modal.css';
class SubtitlesMenu extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            display: true
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', (event) => {
            if(this.myRef.current && !this.myRef.current.contains(event.target)) {
                if (this.props.onClickOutside) {
                    this.props.onClickOutside();
                }
                this.setState({
                    display: false
                }, () => {
                    this.setState({
                        display: true
                    })
                })
            }
        })
    }
    render() {
        return (
        this.state.display &&   <div className='ctxmenu' ref={this.myRef}>
                <ul className='list'>
                    {this.props.menuItems.map((item) => 
                    <li className='listitem' onMouseDown={(e) => {
                        e = e || window.event;
                        e.preventDefault(); 
                        e.stopPropagation();
                        item.onClick()
                    }}>{item.label}</li>)
                    
                    }
                </ul>
            </div>)
    }
}
export default SubtitlesMenu;