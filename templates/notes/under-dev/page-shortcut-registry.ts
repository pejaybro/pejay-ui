let newRecordHandler: (() => void) | null = null;

export function setPageNewRecordHandler(handler: (() => void) | null) {
  newRecordHandler = handler;
}

export function getPageNewRecordHandler() {
  return newRecordHandler;
}
