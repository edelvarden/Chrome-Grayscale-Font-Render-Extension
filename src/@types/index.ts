export interface FontListItem {
  fontId: string
  displayName: string
  isGoogleFont?: boolean
}

export interface GoogleFont {
  fontFamily: string
  displayName: string
  fontStyle: string
}

export interface SelectOption {
  fontId: string
  displayName: string
}

export interface Message {
  action: string
}
