
import { ShapeType, ShapeConfig } from './types';

export const SHAPES: ShapeConfig[] = [
  {
    id: ShapeType.CUBOID,
    name: 'Hình Hộp Chữ Nhật',
    description: 'Có 6 mặt đều là hình chữ nhật.',
    faces: 6,
    edges: 12,
    vertices: 8,
    realWorldExamples: [
      { title: 'Hộp Quà', description: 'Các hộp đóng gói hàng hóa thường có dạng này.', iconName: 'Gift' },
      { title: 'Cuốn Sách', description: 'Một vật dụng học tập quen thuộc hàng ngày.', iconName: 'Book' },
      { title: 'Tủ Lạnh', description: 'Thiết bị gia dụng phổ biến trong nhà bếp.', iconName: 'Refrigerator' }
    ]
  },
  {
    id: ShapeType.TRIANGULAR_PRISM,
    name: 'Lăng Trụ Đứng Tam Giác',
    description: 'Có 2 đáy là tam giác và 3 mặt bên là hình chữ nhật.',
    faces: 5,
    edges: 9,
    vertices: 6,
    realWorldExamples: [
      { title: 'Hộp Socola', description: 'Thiết kế đặc trưng của hãng Toblerone.', iconName: 'Candy' },
      { title: 'Mái Nhà', description: 'Dạng mái thái phổ biến ở các ngôi nhà.', iconName: 'Home' },
      { title: 'Lều Trại', description: 'Nơi trú ẩn hình lăng trụ khi đi dã ngoại.', iconName: 'Tent' }
    ]
  },
  {
    id: ShapeType.QUADRILATERAL_PRISM,
    name: 'Lăng Trụ Đứng Tứ Giác',
    description: 'Lăng trụ đứng có đáy là một tứ giác (ví dụ: hình thang).',
    faces: 6,
    edges: 12,
    vertices: 8,
    realWorldExamples: [
      { title: 'Đập Nước', description: 'Mặt cắt ngang của đập thường là hình thang.', iconName: 'Waves' },
      { title: 'Bồn Hoa', description: 'Bồn hoa trang trí trên phố có đáy tứ giác.', iconName: 'Flower' },
      { title: 'Khối Bê Tông', description: 'Các dải phân cách hoặc khối chắn sóng.', iconName: 'Square' }
    ]
  }
];

export const COLORS = {
  FACE_BASE: '#3b82f6', // Blue 500
  FACE_SIDE: '#ef4444', // Red 500
  FACE_TOP: '#10b981',  // Emerald 500
  HIGHLIGHT: '#f59e0b', // Amber 500
  EDGE: '#000000',      // Đen đậm tuyệt đối
  VERTEX: '#0f172a',    // Slate 900
};
