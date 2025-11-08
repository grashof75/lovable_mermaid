export interface Comment {
  id: string;
  text: string;
  timestamp: number;
  linkedViewId?: string; // Vista collegata (può essere provvisoria)
  isProvisional?: boolean; // Se la vista collegata è provvisoria
  viewId?: string; // Vista a cui è associato il commento
}

export interface ProvisionalView {
  id: string;
  name: string;
  zoom: number;
  pan: { x: number; y: number };
  timestamp: number;
  commentId: string; // ID del commento collegato
  isProvisional: true;
}