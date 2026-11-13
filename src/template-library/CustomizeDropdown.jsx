import * as Menu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Trash2 } from 'lucide-react';

// shadcn/ui Dropdown Menu pattern, using the library's existing CSS tokens.
export default function CustomizeDropdown({ label, value, options, onChange, group, onDelete, disabled }) {
  const selected = options.find(option => option.id === value);
  const item = option => (
    <Menu.Item key={option.id} className="tl-menu-item" onSelect={() => onChange(option.id)}>
      {value === option.id && <Check size={14} />}
      <span>{option.name}</span>
    </Menu.Item>
  );
  return (
    <Menu.Root>
      <Menu.Trigger className="tl-menu-trigger" aria-label={label} disabled={disabled}>
        <span>{selected?.name ?? options[0]?.name}</span>
        <ChevronDown size={15} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className="tl-menu-content" align="end" sideOffset={6} collisionPadding={12}>
          {options.filter(option => !option.saved).map(item)}
          {group && (
            <Menu.Group>
              <Menu.Label className="tl-menu-label">{group}</Menu.Label>
              {options
                .filter(option => option.saved)
                .map(option => (
                  <div className="tl-menu-row" key={option.id}>
                    {item(option)}
                    <Menu.Item
                      className="tl-menu-delete"
                      aria-label={`Delete ${option.name}`}
                      onSelect={event => {
                        event.preventDefault();
                        onDelete(option);
                      }}
                    >
                      <Trash2 size={15} />
                    </Menu.Item>
                  </div>
                ))}
            </Menu.Group>
          )}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
