export interface CreateWarehouseDto {
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
}

export interface UpdateWarehouseStockDto {
  stock: number;
}

export interface WarehouseResponseDto {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WarehouseMapper {
  static toResponseDto(warehouse: any): WarehouseResponseDto {
    return {
      id: warehouse.id,
      name: warehouse.name,
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
      stock: warehouse.stock,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  static toResponseDtoList(warehouses: any[]): WarehouseResponseDto[] {
    return warehouses.map(warehouse => this.toResponseDto(warehouse));
  }
}
