describe('Simple tests', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string concatenation', () => {
    expect('hello ' + 'world').toBe('hello world');
  });

  it('should confirm boolean logic', () => {
    expect(true).toBe(true);
    expect(false).toBe(false);
    expect(true && true).toBe(true);
    expect(true && false).toBe(false);
  });
}); 