import { handlerPath } from './handler-resolver';

describe('handlerPath', () => {
  beforeEach(() => {
    jest.spyOn(process, 'cwd').mockReturnValue('/User/test/feedback-api');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a relative UNIX-style path from a UNIX-style absolute path', () => {
    const inputPath = '/User/test/feedback-api/summary/handler.ts';
    expect(handlerPath(inputPath)).toBe('summary/handler.ts');
  });

  it('should return a relative UNIX-style path from a Windows-style absolute path', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('C:\\User\\test\\feedback-api');
    const inputPath = 'C:\\User\\test\\feedback-api\\src\\handler.js';
    expect(handlerPath(inputPath)).toBe('src/handler.js');
  });

  it('should return an empty string if the input path is the same as cwd', () => {
    const inputPath = '/User/test/feedback-api';
    expect(handlerPath(inputPath)).toBe('');
  });

  it('should return an empty string if cwd path is an empty string', () => {
    jest.spyOn(process, 'cwd').mockReturnValue('');
    const inputPath = 'C:\\User\\test\\feedback-api\\src\\handler.js';
    expect(handlerPath(inputPath)).toBe('');
  });

  it('should throw an error if the context string and cwd do not share the same starting path', () => {
    const inputPath = '/different/path/not/matching/cwd/handler.ts';
    expect(() => handlerPath(inputPath)).toThrow(TypeError);
  });

  it('should throw an error if the context string is an empty string', () => {
    const inputPath = '';
    expect(() => handlerPath(inputPath)).toThrow(TypeError);
  });
});
