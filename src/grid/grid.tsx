/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import GridItem from './grid-item';
import { Dialog } from '../dialog/dialog';

interface State {
  // grid itself state
  rows: any[]; // all rows
  selection: any[]; // currently selected rows
  processing: any[]; // rows currently processed by some command

  // state for print summary command
  isPrintSumDialogVisible: boolean;
  thinking: boolean;
  totalAmount: number;
  // state for rename command
  isRenamingDialogVisible: boolean;
}



export class Grid extends React.Component<{}, State> {
  state: Readonly<State> = {
    rows: [
      {
        id: Math.random()
          .toString(36)
          .slice(2),
        name: 'One',
        amount: 0,
        newName: 'One',
      },
      {
        id: Math.random()
          .toString(36)
          .slice(2),
        name: 'Two',
        amount: 16,
        newName: 'Two',
      },
      {
        id: Math.random()
          .toString(36)
          .slice(2),
        name: 'Three',
        amount: 0,
        newName: 'Three',
      },
      {
        id: Math.random()
          .toString(36)
          .slice(2),
        name: 'Const',
        amount: 42,
        newName: 'Three',
      },
    ],
    selection: [],
    processing: [],
    isPrintSumDialogVisible: false,
    thinking: false,
    isRenamingDialogVisible: false,
    totalAmount: NaN,
  };

  handleSelectToggle = (row: any) => {
    const { selection } = this.state;
    if (selection.indexOf(row) === -1) {
      this.setState({ selection: [...selection, row] });
    } else {
      this.setState({ selection: selection.filter(item => item !== row) });
    }
  };

  handleCommandComplete = (updatedItems: any[] = []) => {
    const updatedRows = this.state.rows.map(row => updatedItems.find(item => item.id === row.id) || row);
    const updatedSelection = this.state.selection.map(row => updatedItems.find(item => item.id === row.id) || row);
    this.setState({
      rows: updatedRows,
      selection: updatedSelection,
      processing: [],
      isPrintSumDialogVisible: false,
      isRenamingDialogVisible: false,
    });
  };

  runIncreaseCommand = () => {
    const updated = this.state.processing.map(row => ({
      ...row,
      amount: row.amount + 1,
    }));
    window.setTimeout(() => this.handleCommandComplete(updated), 100);
  };

  runDecreaseCommand = () => {
    const updated = this.state.processing.map(row => ({
      ...row,
      amount: row.amount - 1,
    }));
    window.setTimeout(() => this.handleCommandComplete(updated), 100);
  };

  runPrintSumCommand = () => {
    this.setState({ isPrintSumDialogVisible: true, thinking: true });
    window.setTimeout(() => {
      const totalAmount = this.state.processing.reduce((sum, row) => sum + row.amount, 0);
      this.setState({ thinking: false, totalAmount });
    }, 1000);
  };

  runRenameCommand = () => {
    this.setState({ isRenamingDialogVisible: true });
  }

  setNewName = () => {
    const filteredProcessing = this.state.processing.filter(row => row.newName !== row.name);
    const updated = filteredProcessing.map(row => ({
      ...row,
      name: row.newName,
    }));
    window.setTimeout(() => this.handleCommandComplete(updated), 100);
  }

  changeNewName = (value: string) => {
    const updated = this.state.processing.map(row => ({
      ...row,
      newName: value.trim(),
    }));
    this.setState({ processing: updated });
  }

  render() {
    const { rows, selection } = this.state;
    const { isPrintSumDialogVisible, thinking, totalAmount } = this.state;
    const { isRenamingDialogVisible } = this.state;
    return (
      <div className="grid-page">
        <div>
          Toolbar:&nbsp;
          <div className="btn-group">
            <button
              className="btn"
              title="Increase"
              disabled={selection.length === 0 || selection.some(row => row.name === 'Const')}
              onClick={() => this.setState({ processing: this.state.selection.slice() }, this.runIncreaseCommand)}
            >
              <i className="icon icon-plus" />
            </button>
            <button
              className="btn"
              title="Decrease"
              disabled={selection.length === 0 || selection.some(row => row.name === 'Const' || row.amount === 0)}
              onClick={() => this.setState({ processing: this.state.selection.slice() }, this.runDecreaseCommand)}
            >
              <i className="icon icon-minus" />
            </button>
            <button
              className="btn"
              title="Print Summary"
              disabled={selection.length === 0}
              onClick={() => this.setState({ processing: this.state.selection.slice() }, this.runPrintSumCommand)}
            >
              <i className="icon icon-emoji" />
            </button>
            <button
              className="btn"
              title="Rename"
              disabled={selection.length !== 1}
              onClick={() => this.setState({ processing: this.state.selection.slice() }, this.runRenameCommand)}
            >
              <i className="icon icon-edit" />
            </button>
          </div>
        </div>
        {thinking && isPrintSumDialogVisible ? (
          <Dialog>Calculating total amount...</Dialog>
        ) : (
            isPrintSumDialogVisible && (
              <Dialog>
                <div className="modal-header">
                  <div className="modal-title h5">Summary</div>
                </div>
                <div className="modal-body">
                  <div className="content">
                    <p>Total amount for selected items is {totalAmount} pieces</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn" onClick={() => this.handleCommandComplete([])}>
                    OK
                </button>
                </div>
              </Dialog>
            )
          )}
        {
          isRenamingDialogVisible && (
            <Dialog>
              <div className="modal-header">
                <div className="modal-title h5">Renaming</div>
              </div>
              <div className="modal-body">
                <div className="content">
                  <p>Name of selected item:</p>
                </div>
                <input defaultValue={this.state.processing[0].name} onChange={(e: React.FormEvent<HTMLInputElement>) => this.changeNewName(e.currentTarget.value)}></input>
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={() => this.setNewName()}>
                  Rename
                </button>
              </div>
            </Dialog>
          )
        }
        <ul className="grid">
          {rows.map(row => {
            const increaseDisabled = row.name === 'Const';
            const handleRowIncrease = increaseDisabled
              ? undefined
              : () => this.setState({ processing: [row] }, this.runIncreaseCommand);
            const decreaseDisabled = row.name === 'Const' || row.amount === 0;
            const handleRowDecrease = decreaseDisabled
              ? undefined
              : () => this.setState({ processing: [row] }, this.runDecreaseCommand);
            const handleRowRename = () => this.setState({ processing: [row] }, this.runRenameCommand);
            return (
              <GridItem
                key={row.id}
                row={row}
                isSelected={this.state.selection.indexOf(row) !== -1}
                onSelectToggle={this.handleSelectToggle}
                contextMenu={
                  <>
                    <li className={'menu-item' + (increaseDisabled ? ' disabled' : '')}>
                      <a onClick={handleRowIncrease}>Increase</a>
                    </li>
                    <li className={'menu-item' + (decreaseDisabled ? ' disabled' : '')}>
                      <a onClick={handleRowDecrease}>Decrease</a>
                    </li>
                    <li className={'menu-item'}>
                      <a onClick={handleRowRename}>Rename</a>
                    </li>
                  </>
                }
              />
            );
          })}
        </ul>
      </div>
    );
  }
}
