import React, {Component} from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {_Resources} from '../../Collections/collections.js';
import Header from '../layouts/Header.jsx';
import Sidenav from './Sidenav.jsx';

export  class AllResources extends Component {

    renderResources() {
        var count = 1;
        return this.props.resources.map((resource) => (
            <tr key={resource._id} onClick={this.handleUrl.bind(this, resource._id, resource.topicId)} className="link-section">
                <td>{count++}</td>
                <td>{resource.name}</td>
                <td>{resource.file.type.split('/')[1]}</td>
            </tr>
        ))
    }
    handleUrl(id, topicId, event) {
        event.preventDefault();
        FlowRouter.go(`/dashboard/view_resource/${id}`);
        return ;
    }

    render() {

        return (
            <div>
                <Header/>

                <div className="row">
                  <div className="col s3">
                    <Sidenav resources={' active'}/>

                  </div>
                  <div className="col s1">

                  </div>
                {/* <span>
                    <a href="" onClick={this.showNav.bind(this)} className="fa fa-bars fa-3x"></a>
                </span> */}
                <div className="col s8">
                    <h4>List of All resources</h4>
                    <table className="highlight">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Resource</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderResources()}
                        </tbody>
                    </table>
                </div>
              </div>

            </div>
        )
    }

}

export default createContainer(() => {
  Meteor.subscribe('resources')

    return {
      resources: _Resources.find().fetch()}
}, AllResources)
