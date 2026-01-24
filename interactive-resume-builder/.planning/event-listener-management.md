# Event Listener Management Issue

## Issue Description

When the form is re-rendered (e.g., when clicking "Add" button), the form DOM elements are recreated via `FormView.render()`. However, the `Form` class's input event listeners are not automatically re-attached to the newly created form elements.

## Current Flow

1. `Form.build()` calls `FormView.render()` and `attachEventListeners()`
2. When user clicks "Add" button in FormView:
   - `FormView.render()` is called, recreating all form DOM elements
   - `Form.attachEventListeners()` is NOT called again
   - New form inputs exist but have no event listeners attached
   - User input on new fields is not captured

## Potential Solution

Add a callback mechanism from FormView to Form:

- FormView could call a callback after rendering completes
- Form could re-attach event listeners in that callback
- This ensures all form inputs always have listeners, regardless of when the form is re-rendered

## Code Changes Needed

1. Add `onRenderComplete` callback to FormView's RenderContext
2. Add `setRenderCompleteCallback()` method to FormView
3. Call the callback at the end of `FormView.render()`
4. Set the callback in Form constructor to call `attachEventListeners()`

## Status

This improvement was identified as secondary to the actual data-passing bug. The real issue was that form inputs were never populated with model data during rendering.
