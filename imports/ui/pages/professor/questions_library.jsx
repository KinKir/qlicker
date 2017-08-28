// QLICKER
// Author: Enoch T <me@enocht.am>
//
// questions_library.jsx: page for managing and editing your own questions

import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'
import _ from 'underscore'

import { QuestionEditItem } from '../../QuestionEditItem'
import { QuestionDisplay } from '../../QuestionDisplay'
import { QuestionSidebar } from '../../QuestionSidebar'

import { Questions } from '../../../api/questions'
import { Courses } from '../../../api/courses'

export const createNav = (active) => {
  return (<ul className='nav nav-pills'>
    <li role='presentation' className={active === 'library' ? 'active' : ''}>
      <a href={Router.routes['questions'].path()}>Question Library</a>
    </li>
    <li role='presentation' className={active === 'public' ? 'active' : ''}><a href={Router.routes['questions.public'].path()}>Public Questions</a></li>
    <li role='presentation' className={active === 'student' ? 'active' : ''}><a href={Router.routes['questions.fromStudent'].path()}>Student Submissions</a></li>
  </ul>)
}

class _QuestionsLibrary extends Component {

  constructor (props) {
    super(props)

    this.state = {
      edits: {},
      selected: null,
      questions: props.library,
      limit: 11,
      query: props.query,
      questionMap: _(props.library).indexBy('_id')
    }

    if (this.props.selected) {
      if (this.props.selected in this.state.questionMap) this.state.selected = this.props.selected
    }

    this.editQuestion = this.editQuestion.bind(this)
    this.questionDeleted = this.questionDeleted.bind(this)
    this.updateQuery = this.updateQuery.bind(this)
  }

  editQuestion (questionId) {
    if (questionId === -1) {
      const blankQuestion = {
        plainText: '', // plain text version of question
        type: -1,
        content: '', // wysiwyg display content
        options: [],
        tags: [],
        owner: Meteor.userId(),
        approved: true
      }
      Meteor.call('questions.insert', blankQuestion, (e, newQuestion) => {
        if (e) return alertify.error('Error: couldn\'t add new question')
        alertify.success('New Blank Question Added')
        this.setState({ selected: null }, () => {
          this.setState({ selected: newQuestion._id })
        })
      })
    } else {
      this.setState({ selected: null }, () => {
        this.setState({ selected: questionId })
      })
    }
  }

  questionDeleted () {
    this.setState({ selected: null })
  }

  updateQuery (childState) {
    let params = this.state.query
    params.options.limit = this.state.limit

    if (childState.questionType > -1) params.query.type = childState.questionType
    else params.query = _.omit(params.query, 'type')
    if (childState.searchString) params.query.plainText = {$regex: '.*' + childState.searchString + '.*', $options: 'i'}
    else params.query = _.omit(params.query, 'plainText')
    if (childState.tags.length) params.query['tags.value'] = { $all: _.pluck(childState.tags, 'value') }
    else params.query = _.omit(params.query, 'tags.value')

    const newQuestions = Questions.find(params.query, params.options).fetch()
    if (!_.findWhere(newQuestions, {_id: this.state.selected})) this.setState({ selected: null, questions: newQuestions })
    else this.setState({questions: newQuestions, questionMap: _(newQuestions).indexBy('_id')})
  }

  componentWillReceiveProps () {
    const newQuestions = Questions.find(this.state.query.query, this.state.query.options).fetch()
    if (!_.findWhere(newQuestions, {_id: this.state.selected})) {
      this.setState({ selected: null, questions: newQuestions, questionMap: _(newQuestions).indexBy('_id') })
    } else this.setState({questions: newQuestions, questionMap: _(newQuestions).indexBy('_id') })
  }

  render () {
    let library = this.state.questions || []

    const atMax = library.length !== this.state.limit
    if (!atMax) library = library.slice(0, -1)

    const increase = (childState) => {
      this.setState({limit: this.state.limit + 10}, () => this.updateQuery(childState))
    }
    const decrease = (childState) => {
      this.setState({limit: this.state.limit - 10}, () => this.updateQuery(childState))
    }

    if (this.props.loading) return <div className='ql-subs-loading'>Loading</div>
    return (
      <div className='container ql-questions-library'>
        <h1>My Question Library</h1>
        {createNav('library')}

        <div className='row'>
          <div className='col-md-4'>
            <br />
            <button className='btn btn-primary' onClick={() => this.editQuestion(-1)}>New Question</button>
            <QuestionSidebar
              questions={library}
              onSelect={this.editQuestion}
              increase={increase}
              decrease={decrease}
              atMax={atMax}
              updateQuery={_.throttle(this.updateQuery, 800)} />
          </div>
          <div className='col-md-8'>
            { this.state.selected
            ? <div>
              <div id='ckeditor-toolbar' />
              <div className='ql-edit-item-container'>
                <QuestionEditItem
                  question={this.state.questionMap[this.state.selected]}
                  deleted={this.questionDeleted}
                  metadata autoSave />
              </div>
              <div className='ql-preview-item-container'>
                {this.state.selected
                  ? <QuestionDisplay question={this.state.questionMap[this.state.selected]} readonly noStats />
                  : ''
                }
              </div>
            </div>
            : '' }
          </div>
        </div>
      </div>)
  }
}

export const QuestionsLibrary = createContainer(() => {
  const handle = Meteor.subscribe('courses') && Meteor.subscribe('questions.library')
  const courses = _.pluck(Courses.find({instructors: Meteor.userId()}).fetch(), '_id')
  let params = {
    query: {
      '$or': [{owner: Meteor.userId()}, {courseId: { '$in': courses }, approved: true}],
      sessionId: {$exists: false}
    },
    options: {
      sort: { createdAt: -1 },
      limit: 11
    }
  }
  const library = Questions.find(params.query, params.options).fetch()

  return {
    query: params,
    library: library,
    courses: courses,
    loading: !handle.ready()
  }
}, _QuestionsLibrary)

