import { SelectOption } from '@types';
import { TemplateResult } from 'lit';
import './select.css';
interface SelectComponentProps {
    id: string;
    value?: string | undefined;
    options: SelectOption[];
    handleChange: (event: Event) => void;
}
export default function SelectComponent(props: SelectComponentProps): TemplateResult;
export {};
