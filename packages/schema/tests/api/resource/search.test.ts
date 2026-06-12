import { ResourceSearchReqParamsSchema } from '@schema/api/resource/search';

describe('ResourceSearchReqSchema', () => {
  describe('success', () => {
    it('全項目をパースできる', () => {
      const input = {
        q: 'hero',
        type: 'player',
        cursor: 'next-cursor',
        limit: 20,
      };

      const result = ResourceSearchReqParamsSchema.parse(input);

      expect(result).toEqual({
        q: 'hero',
        type: 'player',
        cursor: 'next-cursor',
        limit: 20,
      });
    });

    it('省略時はデフォルト値が適用される', () => {
      const result = ResourceSearchReqParamsSchema.parse({});

      expect(result).toEqual({
        q: '',
        limit: 40,
      });
    });

    it('limit文字列をnumberへ変換できる', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        limit: '50',
      });

      expect(result.limit).toBe(50);
      expect(typeof result.limit).toBe('number');
    });

    it('typeなしでもパースできる', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        q: 'hero',
      });

      expect(result).toEqual({
        q: 'hero',
        limit: 40,
      });
    });

    it('cursorなしでもパースできる', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        q: 'hero',
        type: 'player',
      });

      expect(result).toEqual({
        q: 'hero',
        type: 'player',
        limit: 40,
      });
    });
  });

  describe('limit validation', () => {
    it('最小値1を許可する', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        limit: 1,
      });

      expect(result.limit).toBe(1);
    });

    it('最大値100を許可する', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        limit: 100,
      });

      expect(result.limit).toBe(100);
    });

    it('0は失敗する', () => {
      const result = ResourceSearchReqParamsSchema.safeParse({
        limit: 0,
      });

      expect(result.success).toBe(false);
    });

    it('101は失敗する', () => {
      const result = ResourceSearchReqParamsSchema.safeParse({
        limit: 101,
      });

      expect(result.success).toBe(false);
    });

    it('数値に変換できない文字列は失敗する', () => {
      const result = ResourceSearchReqParamsSchema.safeParse({
        limit: 'abc',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('type validation', () => {
    it('存在しないtypeは失敗する', () => {
      const result = ResourceSearchReqParamsSchema.safeParse({
        type: 'invalid-type',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('q', () => {
    it('空文字を許可する', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        q: '',
      });

      expect(result.q).toBe('');
    });
  });

  describe('cursor', () => {
    it('任意の文字列を許可する', () => {
      const result = ResourceSearchReqParamsSchema.parse({
        cursor: 'eyJpZCI6IjEyMyJ9',
      });

      expect(result.cursor).toBe('eyJpZCI6IjEyMyJ9');
    });
  });
});
