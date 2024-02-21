import { handlerPath } from './handler-resolver';

describe('handlerPath success cases', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const testCases = [
    {
      name: 'should return a relative UNIX-style path from a UNIX-style absolute path',
      cwd: '/User/test/feedback-api',
      inputPath: '/User/test/feedback-api/summary/handler.ts',
      expected: 'summary/handler.ts'
    },
    {
      name: 'should return a relative UNIX-style path from a Windows-style absolute path',
      cwd: 'C:\\User\\test\\feedback-api',
      inputPath: 'C:\\User\\test\\feedback-api\\src\\handler.js',
      expected: 'src/handler.js'
    },
    {
      name: 'should return an empty string if the input path is the same as cwd path',
      cwd: '/User/test/feedback-api',
      inputPath: '/User/test/feedback-api',
      expected: ''
    },
    {
      name: 'should return an empty string if cwd path is an empty string',
      cwd: '',
      inputPath: 'C:\\User\\test\\feedback-api\\src\\handler.js',
      expected: ''
    }
  ];
  it.each(testCases)('$name', ({ cwd, inputPath, expected }) => {
    jest.spyOn(process, 'cwd').mockReturnValue(cwd);
    expect(handlerPath(inputPath)).toBe(expected);
  });
});

describe('handlerPath error cases', () => {
  beforeEach(() => {
    jest.spyOn(process, 'cwd').mockReturnValue('/User/test/feedback-api');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const errorTestCases = [
    {
      name: 'should throw an error if the context path and cwd path do not share the same starting path',
      inputPath: '/different/path/not/matching/cwd/handler.ts'
    },
    {
      name: 'should throw an error if the context path is an empty string',
      inputPath: ''
    }
  ];

  it.each(errorTestCases)('$name', ({ inputPath }) => {
    expect(() => handlerPath(inputPath)).toThrow(TypeError);
  });
});
