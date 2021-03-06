# Adding a todo: writing a Todo List reducer

While the state in the previous application was simply a number, in this application, the state is an array of `todo`s.
A `todo` is a simple object with an `id`, its `text` and a `completed` boolean to specify if the todo has been done or not.
The `id` and the `text` of the `todo` to add are basically provided by the action (`id` and `text` properties of the action itself).

So let's begin by writting the Todo reducer for the `'ADD_TODO'` action. As in the previous application, we provide a test to be sure the reducer implementation you will provide is correct ;-)

Just remember that the reducer is a **pure** function. Then you don't have to modify the supllied `state`, you have to create a new one!
Some ES6 feature as destructuring is really a nice help for that ;-)

@[Add todo reducer]({
  "stubs": ["src/reducers/todos-add.js", "src/reducers/todos-add.spec.js"],
  "command": "yarn techio-test -- todos-add",
  "project": "todos"
})


# Toggling a todo: updating the Todo List reducer

In this section, we're following the same previous approach to implement the `'TOGGLE_TODO'` action.
The idea behind this action is to toggle the `completed` property of a given `todo`. The action owns the `id` of the `todo` to toggle.

The toggle reducer implementation is not really complicated, but… watch out… it is a pure function so don't modify the state!

But what does it mean?

Mainly, that is mean that the new state array should be a new one. You don't have to modify the array itself.
But, in this new array, you have to keep the reference to the `todo` which haven't change. Then, react will easily understand that some todos did not change and has not to "redraw" them. Finally, the `todo` which has been toggled should be a new one.

Let's code this new toggle reducer. Using the `map` method could ease its writting

@[Toggle todo reducer]({
  "stubs": ["src/reducers/todos-toggle.js", "src/reducers/todos-toggle.spec.js"],
  "command": "yarn techio-test -- todos-toggle",
  "project": "todos"
})


# Reducers refactoring: composition

In the previous sections we wrote a reducer which can handle 2 actions: adding a new `todo` and toggling a given `todo`. But, the code to update a `todo` or to create a new one is embedded into the `todos` reducer. That is not really a good thing because it mixes 2 different concerns: how the `todos` *array* is updated and how *individual* `todo`s are updated.

Because you're aware about this problem of [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns), you would want to extract 2 more specific functions which addresses a single concern. In this context, you can extract a function that is responsible to create and update a single `todo` called `todo()` with the `state` and the `action` as parameters. Then the `'TOGGLE_TODO'` action in the `todo` reducer will create a new toggled `todo` if the supplied todo provided as the `state` matches with the one specifying in the `action`.

You can then rewrite the `todos` reducer easily using the `todo` one.

This is the reducer composition: different reducers specify how different parts of the state tree are updated in response to actions.
Because reducers are *normal* javascript functions, a reducer can call other reducers naturally to delegate an abstract way handling an update of some parts of the state it manages.

Just let's do it. Hopefully we have some tests to check if the refactore does the right thing ;-)

@[Toggle todo reducer]({
  "stubs": ["src/reducers/todos-refactored.js", "src/reducers/todos-refactored.spec.js"],
  "command": "yarn techio-test -- todos-refactored",
  "project": "todos"
})


# Visibility filter: reducers composition with object

For now, we have an application with a store representing an array of todos and with reducers to add and toggle `todos`.
Now we want let the user choose which `todos` are currently visible according to the `completed` status of `todos`.

To implement this new feature, we will introduce a `visibilityFilter` reducer which should show all, show complete or show active `todos`.
The state of the visibilityFilter reducer is a simple `string` represented the current filter value. It changes through the `'SET_VISIBILITY_FILTER'` action which contains the new filter value.

The code of this `visibilityFilter` reducer is really obvious:

@[visibilityFilter reducer]({
  "stubs": ["src/reducers/visibilityFilter.js", "src/reducers/visibilityFilter.spec.js"],
  "command": "yarn techio-test -- visibilityFilter",
  "project": "todos"
})


To store this new information, we don't need to change the existing reducers. We will use the reducer composition pattern as we see it previously. Let's then create a new reducer  which calls all the existing reducers to manage all the parts of the application state management and combine the results into a single state object:

```javascript
const todoApp = (state = {}, action) => {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  }
}
```

This is a new example of the reducers composition pattern. But this time we use it to combine severall reducers into a single reducer that now we can use to **create our unique application store**: `createStore(todoApp)`. The initial state of the combined reducers now contain the initial state of the independant reducers. Anytime an action comes in, those reducers handle the action independantly.

In fact, this pattern is so common that it is present in most redux applications. This is why redux provides a function called `combineReducers` that lets you avoid to write this code by hand. It generates the "top" reducer just for you. The only argument to provide to the `combineReducers` is an object. This object specifies the mapping between the `state` object names and the reducers that manage them.

```javascript
const todoApp = combineReducers({
  todos: todos,
  visibilityFilter: visibilityFilter
})
```

 The returned value of this `combineReducers` is a reducer function which is pretty much equivalent to the `todoApp` function written previously.

Then, by convention, if you call your reducers exactly as the state property name it manages, the combined reducers could easily simplify (thanks to ES6 object literal shorthand notation) in: `combineReducers({todos, visibilityFilter})`. Pretty nice, don't you think?


# Bootstrap of the view

Ok! We have a simple root reducer splitted in many reducers easily to maintain and debug. Now it's time to code the view of this simple todo application with React.

Exactly like the previous counter application, we will code a main render function that uses react to render the `TodoApp` component into the root DOM element. And also we subscribe this render function to the store changes. That could be something like:

```javascript
const todoApp = combineReducers({ todos, visibilityFilter })
const store = createStore(todoApp)
const render = () => {
  ReactDOM.render(<TodoApp />, document.getElementById('root'))
}
store.subscribe(render)
render()
```

It is not necessary to write it by your own because it will be simplified at the end of this playground ;-)

This section provides a very simple `TodoApp` component in order to bootstrap the application.
The idea is just to provide 3 main html elements:
  - an input in which the user can enter the text of its todos
  - a button which adds a `todo` with the supplied text in the input
  - a list in which the created todos are displayed.

You can see common pattern for react component: dispatching actions that will update the application and rendering the current state.

A global variable is used to manage the todo ids. As you can see in the code bellow, the todos are provided as `TodoApp` component `props`.

As you can see, the component renders the `todos` from its properties, not its own state like we can see in react application. That is because the main `render` function listens to the store changes and pass the todos values from the store to the `TodoApp` component properties. Thanks to this redux flow, you obtain a stateless react component.

You can test this first todo list application with the code provided just bellow.

It is up to you now to add the toggle feature into the component!

The idea is to toggle the `completed` state of the prop just by clicking on it on le list of `todos`. So, you have to add a `onClick` handler which has to dispatch the `'TOGGLE_TODO'` action.
In the user interface, we want the completed `todo` to appear cross. So you have to add the `style` attribute to the `li` element with the `textDecoration` attribute to `'line-through'` when the todo is completed and `'none'` otherwise. The syntax of the style attribute is to use 2 `{{}}` and to use a classical javascript syntax for the object: `textDecoration: todo.completed ? ...`

@[TodoApp boostrap component]({
  "stubs": ["src/TodoApp.js", "src/reducers/todos.js", "src/reducers/visibility-filter.js"],
  "command": "yarn techio-start -- TodoApp",
  "project": "todos"
})


# Visibility filter component

Now we have to implement the visibility filter to show all, the completed or the active todos.

We propose to create a new `FilterLink` component which could be render a simple html anchor which dispatches the `SET_VISIBILITY_FILTER` action with the right action `filter` name, e.g. `'SHOW_ALL'`, `'SHOW_ACTIVE'` and `'SHOW_COMPLETE'`. 3 `FilterLink` components are then added into the `TodoApp` component, at the bottom.

If you stop here, you forget one of the main responsibility of component: render the current state. So, we have to render the todos for which their `completed` status matches the installed filter.

It seems a good idea to define a function `getTodos(todos, filter)` which return the todos corresponding the filter value. The `TodoApp` will have to use this function instead of all the `todos` directly. Watch out that the filter value is in the store state as `visibilityFilter`, then it should be provided to the `TodoApp` component through its properties.

Let's try to code all this visibility feature…

@[Simple TodoApp with visibility filter]({
  "stubs": ["src/TodoApp-filter.js"],
  "command": "yarn techio-start -- TodoApp-filter",
  "project": "todos"
})

That's right?

Now, it could be nice to show the selected filter in order to be more explicit. In our context, the simplest way to do that is to provide the current filter value to the `FilterLink` component and then, display a simple `span` instead of a `anchor` if the current filter is the same as the filter one.

Easy

@[Simple TodoApp with selected visibility filter]({
  "stubs": ["src/TodoApp-filter-selected.js"],
  "command": "yarn techio-start -- TodoApp-filter-selected",
  "project": "todos"
})


# TodoApp refactoring: extract presentational components

Nice, we have our application working! Good work!

But, in react application we really like to have many components that can be used, tested and updated by different people separately.
So we are going to refactore our application extracting many components.

The first component that could be extracted in this todo list application is… the `Todo` component ;-)
This `Todo` component just renders a single list item. This should be something like:

```javascript
const Todo = () => {
  <li key={todo.id}
    onClick={() => {
        store.dispatch({
            type: 'TOGGLE_TODO',
            id: todo.id
        })
    }}
    style={{
        textDecoration: todo.completed ? 'line-through': 'none'
    }}>
    {todo.text}
  </li>
}
```

We can then remove the special `key` attribute which is only used when a specific array is displayed but, here, just one component is rendered.
We designing a component, the idea is to make it flexible as it is reasonable. Right now the click in a todo is hardcoded to dispatch the `'TOGGLE_TODO'` action. It could be ok to do that, but often we prefer to have component that don't specify any behaviour, just concern by how the be rendered. This kind of component could be called "presentational components". We can then define a `onClick` `props` to the `Todo` component. Equaly, it could be better to specify exactly the text that will be displayed instead of get it on a specific property of an object. The more cleaner `Todo` component could be:

```javascript
const Todo = ({onClick, completed, text}) => {
  <li key={todo.id}
    onClick={onClick}
    style={{
        textDecoration: completed ? 'line-through': 'none'
    }}>
    {text}
  </li>
}
```

Lets extract the `TodoList` component. It is also a presentational component which only concern by how the todos list looks. Given the todos list, it will render each todo. Because the `Todo` component needs an `onClick` callback in its `props`, the `TodoList` will also accept an `onTodoClick` callback which will call the `onClick` with the specific `todo` `id` to distinguish the clicked todo:

```javascript
const TodoList = ({todos, onTodoClick}) => {
  <ul>
    {todos.map(todo =>
      <Todo key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
}
```

Continue to extract presentational components extracting the `input` and the `button` in a separate component called `AddTodo`.
It is done exactly as previously with an `onAddClick` callback to specify what to do when the button is clicked:

```javascript
const AddTodo = ({ onAddClick }) => {
  let todoText

  <div>
    <input ref={node => todoText = node} />
    <button onClick={() => {
      onAddClick(todoText.value)
      todoText.value = ''
    }}>
      Add Todo
    </button>
  </div>
}
```

Providing these 3 extracted components, lets use it in the previous solution in order to simplify the `TodoApp` component code:

@[Extract the first presentational components]({
  "stubs": ["src/TodoApp-refact1.js"],
  "command": "yarn techio-start -- TodoApp-refact1",
  "project": "todos"
})

As a final exercise about extracting presentational component, I propose you to extract the `Footer` component.
This `Footer` component contains all the visibility filters. Obviously, this `Footer` component gets the `visibilityFilter` as parameter. But, to make the `FilterLink` a presentational component, an `onClick` parameter has to be added to this `FilterLink` which is provided by the `Footer` thanks to its own `onFilterClick` callback parameter.

This concludes the initial refactoring of the todo list application into a single container (because it defines all the behaviour of the other components) called `TodoApp` and many presentational components that are only concern by with how things look.

Once again, this separation of presentational components is not required in redux. But it is a recommanded pattern because it decouples the rendering from redux. So if you later decide to move your project to another framework, you will not have to change all your components because you could keep all your presentational components exactly the same ;-)

However, this approach has a mainly *downside*: you have to pass a lot of props through the components to get them to the components which need them, including the callbacks. As the `Footer` component, some of the components are just intermediate components which just pass the supplied props to another components. This problem can easily be solved by introducing many intermediate container components as we will see in the next section.


# New refactoring: extract container components

If you have done the right job before, you should have defined 2 parameters to the `Footer` component which only pass them to the `FilterLink`. But these 2 parameters are not needed by this `Footer` component. So the simplest refactore that can be done is removing these arguments. Then, we can pass them to the `FilterLink`. So the `Footer` component becomes:

```javascript
const Footer = () => (
  <p>
    Show:
    {" "}
    <FilterLink filter="SHOW_ALL">All</FilterLink>
    {", "}
    <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {", "}
    <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
)
```

The FilterLink does not currently specifiy the behaviour for clicking on the link. It also needs the current filter  to tell wether it should be rendered as active. Therefor, it's a bit dishonest to say that the FilterLink is a real presentational component because it is unseparable from its behaviour. The only reasonable reaction to clicking on it is set the visibility filter by dispatching an action.

That is why it is changed it to another presentational component called `Link`, and we will created another FilterLink component as a container component that uses `Link` for rendering. The Link component does not know anything about the filter. It only accepts the `active` props and it calles it onClick handler:

```javascript
const Link = ({ active, onClick, children }) => {
  if (active) {
      return <span>{children}</span>
  }
  return (
    <a href="#"
      onClick={e => {
        e.preventDefault()
        onClick()
      }}>
      {children}
    </a>
  )
}
```

It is only concerned by rendering.

Now, lets create another FilterLink component. It reads its state from the redux store using the getState method. As a container component, the FilterLink does not have is own presentation markups; it delegates its rendering to the Link presentational component.

```javascript
class FilterLink extends Component {
  render() {
    const props = this.props
    const state = store.getState()

    return (
      <Link
        active={props.filter === state.visibilityFilter}
        onClick={() => store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter: props.filter })}
      >
        {props.children}
      </Link>
    )
  }
}
```

The main problem of this implementation is that the rendering of this component depends on values that are red from the store but it does not listen the store changes. So if the parent component does not update when the store is updated, it going to render stale values. The technic provided by react is to use the life cycle hooks methods to subscribe to and unsubscribe from the store:

```javascript
class FilterLink extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate())
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {...}
}
```

The next candidate of the refactore stuf is the TodoList component. We can keep the TodoList component a presentational component.
However, we can encapsulate the way currently visible todos into a separate component that **connect** the todo list to the redux store.
This is the `VisibleTodoList`.

```javascript
class VisibleTodoList extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => this.forceUpdate())
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  render() {
    const props = this.props
    const state = store.getState()

    return (
      <TodoList
        todos={getTodos(state.todos, state.visibilityFilter)}
        onTodoClick={id => store.dispatch({
          type: 'TOGGLE_TODO',
          id
        })}

      <Link
        active={props.filter === state.visibilityFilter}
        onClick={() => store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter: props.filter })}
      >
        {props.children}
      </Link>
    )
  }
}
```



# Avoid a global store variable
