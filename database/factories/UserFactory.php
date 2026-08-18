<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'tipo_identificacion' => 'CC',
            'numero_identificacion' => fake()->unique()->numerify('##########'),
            'email' => null,
            'password' => static::$password ??= Hash::make('password'),
            'rol' => UserRole::Responsable,
            'must_change_password' => false,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model should be an administrator.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'rol' => UserRole::Admin,
        ]);
    }

    /**
     * Indicate that the model must change its password on next login.
     */
    public function mustChangePassword(): static
    {
        return $this->state(fn (array $attributes) => [
            'must_change_password' => true,
        ]);
    }
}
