import React from 'react';

export default class DisplayMeaning extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meaning: [],
            emptyMessage: 'Please Wait...'
        }
    }
    structureResults = (results) => {
        const arr = [];
        for(let key of results) {
            arr.push(key['meaning']);
            // Object.keys(key['meaning']).forEach(item => arr.push(key['meaning'][item]));
        }
        return arr;
    }
    componentDidMount() {
        const ud = window.require('google-dictionary-api');
        // ud.define(text, (error, results) => {console.log(results)})
        ud.search(this.props.text)
        .then(results => 
            {   if(results.length > 0)
                    this.setState({meaning: this.structureResults(results)})
                else
                    this.setState({emptyMessage: 'Sorry, couldn\'t find anything'})
            })
        .catch(error => {
            this.setState({
                emptyMessage: 'Oops! Something went wrong LOL. Check the dictionary yourself'
            })
        })
    }
    SingleMeaningDisplay = (props) => {
        const {meaningObj} = props;
        return (<div>
            <div>{meaningObj.definition}</div>
            {meaningObj.example ? <div><i><b>Examples</b>: {meaningObj.example}</i></div> : null}
            {meaningObj.synonyms ?<div><b>Synonyms</b>: {meaningObj.synonyms.join(', ')}</div> : null}
        </div>)
    }
    render() {

        return (this.state.meaning.length > 0 ? <div>
            <h3>{this.props.text}</h3>
            {
                this.state.meaning.map(item => {
                    return Object.keys(item).map((elem) => {
                        return (<>
                        <div>{elem}</div>
                        <ul>
                            {item[elem].map(singleMeaning => <li><this.SingleMeaningDisplay meaningObj={singleMeaning}/></li>)}
                        </ul>
                        </>
                        )
                        
                    })
                })
            }
        </div> : <div>
            Please Wait...
        </div>)
    }
}