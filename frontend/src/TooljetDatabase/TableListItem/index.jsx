import React, { useState, useContext } from 'react';
import cx from 'classnames';

import { toast } from 'react-hot-toast';
import { tooljetDatabaseService } from '@/_services';
import { ListItemPopover } from './ActionsPopover';
import { TooljetDatabaseContext } from '../index';
import { ToolTip } from '@/_components';

import Drawer from '@/_ui/Drawer';
import EditTableForm from '../Forms/TableForm';

export const ListItem = ({ active, onClick, text = '', onDeleteCallback }) => {
  const { organizationId, columns, selectedTable, setTables, setSelectedTable } = useContext(TooljetDatabaseContext);
  const [isEditTableDrawerOpen, setIsEditTableDrawerOpen] = useState(false);
  const darkMode = localStorage.getItem('darkMode') === 'true';

  function updateSelectedTable(tablename) {
    setSelectedTable(tablename);
  }

  const handleDeleteTable = async () => {
    const shouldDelete = confirm(`你确定要删除表"${text}"吗？?`);
    if (shouldDelete) {
      const { error } = await tooljetDatabaseService.deleteTable(organizationId, text);

      if (error) {
        toast.error(error?.message ?? `删除表"${text}"失败`);
        return;
      }

      toast.success(`表"${text}"删除成功`);
      onDeleteCallback && onDeleteCallback();
    }
  };

  const formColumns = columns.reduce((acc, column, currentIndex) => {
    acc[currentIndex] = { column_name: column.Header, data_type: column.dataType };
    return acc;
  }, {});

  return (
    <div
      className={cx(
        'table-list-item mb-1 rounded-3 d-inline-flex align-items-center justify-content-between h-4 list-group-item cursor-pointer list-group-item-action border-0 py-1',
        {
          'bg-light-indigo': !darkMode && active,
          'bg-dark-indigo': darkMode && active,
        }
      )}
      data-cy={`${String(text).toLowerCase().replace(/\s+/g, '-')}-table`}
      onClick={onClick}
    >
      <ToolTip message={text}>
        <span
          className="table-name tj-text-xsm"
          data-cy={`${String(text).toLowerCase().replace(/\s+/g, '-')}-table-name`}
        >
          {text}
        </span>
      </ToolTip>
      <ListItemPopover onEdit={() => setIsEditTableDrawerOpen(true)} onDelete={handleDeleteTable} darkMode={darkMode} />
      <Drawer
        disableFocus={true}
        isOpen={isEditTableDrawerOpen}
        onClose={() => setIsEditTableDrawerOpen(false)}
        position="right"
      >
        <EditTableForm
          selectedColumns={formColumns}
          selectedTable={selectedTable}
          updateSelectedTable={updateSelectedTable}
          onEdit={() => {
            tooljetDatabaseService.findAll(organizationId).then(({ data = [] }) => {
              if (Array.isArray(data?.result) && data.result.length > 0) {
                setTables(data.result || []);
              }
            });
            setIsEditTableDrawerOpen(false);
          }}
          onClose={() => setIsEditTableDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};
