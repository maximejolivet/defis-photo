// Formes des données renvoyées par l'API, déduites de leur usage dans le front
// (public/openapi.yaml est plus pauvre : il ne décrit ni user_name, ni challenge_icon…).
// Ce sont des promesses faites au compilateur : rien ne vérifie la réponse à l'exécution.

export interface User {
  id: number;
  pseudo: string;
  token: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface Photo {
  id: number;
  user_id: number;
  user_name: string;
  image_path: string;
  challenge_id: number | null;
  challenge_title: string | null;
  challenge_icon: string | null;
  recipient_pseudo: string | null;
}

export interface Stats {
  my_challenges: number[];
  level: string | null;
  photo_count: number | string;
  challenges_completed: number | string;
}

export interface Winner {
  pseudo: string;
  win_at: string;
}

// Corps des réponses d'erreur (et de succès de login/register).
export interface ApiMessage {
  message?: string;
}

export interface LoginResponse extends ApiMessage {
  user: Omit<User, 'token'>;
  token: string;
}
