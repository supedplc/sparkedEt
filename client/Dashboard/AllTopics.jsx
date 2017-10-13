import React, {Component} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {_Topics, _Resources} from '../../Collections/collections.js';
import Header from '../layouts/Header.jsx';
import Sidenav from './Sidenav.jsx';

export class AllTopics extends Component {

    handleUrl(id,event) {
      FlowRouter.go(`/dashboard/edit_unit/${id}`);
        return;
    }

    renderAllTopics() {
        var count = 1;
        return this.props.topics.map((topic) => (
            <tr key={topic._id} onClick={this.handleUrl.bind(this, topic.unitId)} className="link-section">
                <td>{count++}</td>
                <td>{topic.name}</td>
                <td>{_Resources.find({'topicId': topic._id}).count()}
                </td>
            </tr>
        ));
    }

    showNav(event) {
        event.preventDefault();
        $('.sidenav').show('slow');
    }

    render() {

        return (
            <div>
                <Header/>

                <div className="row">
                    <div className="col m3">
                        <Sidenav topics={'active'}/>
                        <h4></h4>
                    </div>
                    <div className="col m1">

                    </div>

                    <div className="col m8">
                        <h4>List of Topics</h4>

                        <table className="highlight">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Topics</th>
                                    <th>Resources</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderAllTopics()}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        )
    }
}

export default createContainer(() => {
  Meteor.subscribe('topics')

    return {
        topics: _Topics.find().fetch(),
    }
}, AllTopics);
