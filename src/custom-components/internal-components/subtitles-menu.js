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
        console.log('Subtitles Menu CDM called', this.props);
        document.addEventListener('mousedown', (event) => {
            if(this.myRef.current && !this.myRef.current.contains(event.target)) {
                console.log('Encountered Outside Click');
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
                        e.preventDefault(); 
                        item.onClick()
                    }}>{item.label}</li>)
                    
                    }
                </ul>
            </div>)
    }
}
export default SubtitlesMenu;