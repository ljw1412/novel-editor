declare namespace CtxMenu {
  interface Item {
    label: string
    value: string
    icon?: string
    iconColor?: string
    fn?: Function
  }

  interface Position {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}
