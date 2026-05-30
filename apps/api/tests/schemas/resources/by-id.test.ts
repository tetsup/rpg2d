import { ZodError } from 'zod';
import { ResourceByIdReqSchema } from '@api/schemas/resources/by-id';

describe('ResourceGetReqSchema', () => {
  describe('success', () => {
    it('有効な値をパースできる', () => {
      const input = {
        namespace: 'sample',
        type: 'player',
        name: 'hero',
      };

      expect(ResourceByIdReqSchema.parse(input)).toEqual(input);
    });

    it('namespaceに数字を含められる', () => {
      const input = {
        namespace: 'sample1',
        type: 'player',
        name: 'hero',
      };

      expect(ResourceByIdReqSchema.parse(input)).toEqual(input);
    });

    it('nameに数字を含められる', () => {
      const input = {
        namespace: 'sample',
        type: 'player',
        name: 'hero123',
      };

      expect(ResourceByIdReqSchema.parse(input)).toEqual(input);
    });
  });

  describe('namespace validation', () => {
    it('先頭が数字なら失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: '1sample',
          type: 'player',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });

    it('ハイフンを含むと失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample-test',
          type: 'player',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });

    it('空文字は失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: '',
          type: 'player',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });
  });

  describe('type validation', () => {
    it('存在しないtypeは失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          type: 'invalid-type',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });
  });

  describe('name validation', () => {
    it('先頭が英数字以外なら失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          type: 'player',
          name: '-hero',
        })
      ).toThrow(ZodError);
    });

    it('アンダースコアを含むと失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          type: 'player',
          name: 'hero_test',
        })
      ).toThrow(ZodError);
    });

    it('空文字は失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          type: 'player',
          name: '',
        })
      ).toThrow(ZodError);
    });
  });

  describe('required fields', () => {
    it('namespaceがないと失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          type: 'player',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });

    it('typeがないと失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });

    it('nameがないと失敗する', () => {
      expect(() =>
        ResourceByIdReqSchema.parse({
          namespace: 'sample',
          type: 'player',
        })
      ).toThrow(ZodError);
    });
  });
});
