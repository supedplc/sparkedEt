import React, { Component } from 'react';


export default class PageDetails extends Component {


  render(){
    return(
      <tr>

      <td>{this.props.page.page}</td>
      <td>{this.props.page.url}</td>
      <td>{this.props.page.material}</td>
      <td>{this.props.page.freq}</td>
      <td>{this.props.page.date}</td>

      </tr>

    )
  }
}
