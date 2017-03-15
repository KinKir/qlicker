// QLICKER
// Author: Enoch T <me@enocht.am>
//
// StudentResultsList.jsx: Student list displaying answers

import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'

import { Responses } from '../api/responses'

export class _StudentResultsList extends Component {

  render () {
    return (<div className='ql-student-results-list'>
      <table>
        <thead>
          <th>Student</th>
          <th>Answer</th>
          <th>Attempt</th>
        </thead>
        <tbody>
          {
            this.props.responses.map((row) => {
              return (<tr key={row._id}>
                <td>{row.studentUserId}</td>
                <td>{row.answer}</td>
                <td>{row.attempt}</td>
              </tr>)
            })
          }
        </tbody>
      </table>
    </div>)
  } //  end render

}

export const StudentResultsList = createContainer((props) => {
  const handle = Meteor.subscribe('responses.forQuestion', props.question._id)
  const responses = Responses.find({ questionId: props.question._id }).fetch()

  return {
    responses: responses,
    loading: !handle.ready()
  }
}, _StudentResultsList)

StudentResultsList.propTypes = {
  question: PropTypes.object.isRequired
}
