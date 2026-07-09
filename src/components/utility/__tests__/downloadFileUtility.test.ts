import { downloadTextFile } from '../downloadFileUtility';

describe('downloadTextFile', () => {
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    createObjectURLSpy = jest.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = jest.fn();
    (URL as unknown as { createObjectURL: typeof createObjectURLSpy }).createObjectURL = createObjectURLSpy;
    (URL as unknown as { revokeObjectURL: typeof revokeObjectURLSpy }).revokeObjectURL = revokeObjectURLSpy;
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a Blob with the given content and MIME type', () => {
    downloadTextFile('hello world', 'greeting.txt', 'text/plain');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
  });

  it('defaults the MIME type to text/plain when not specified', () => {
    downloadTextFile('hello', 'file.txt');

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
  });

  it('sets the anchor download filename and triggers a click', () => {
    downloadTextFile('BEGIN:VCALENDAR', 'keepwatching-calendar.ics', 'text/calendar');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL after triggering the download', () => {
    downloadTextFile('hello', 'file.txt');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
