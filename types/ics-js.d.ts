declare module 'ics-js' {
    class Component {
        addProp(name: string, value: any): void;
        addComponent(component: Component): void;
        toString(): string;
    }

    class VCALENDAR extends Component { }
    class VEVENT extends Component { }

    export { VCALENDAR, VEVENT };
} 